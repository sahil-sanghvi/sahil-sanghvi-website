import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Runs at ingest time, not request time — Shiki's client bundle is >1MB, so
 * doing this once here means zero client JS for code rendering on the
 * public site. Relative image/link URLs are rewritten to absolute
 * raw.githubusercontent.com / github.com/blob URLs, since a README's
 * relative paths are meaningless once served from our own domain.
 */
export async function renderReadme(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
  path?: string
): Promise<string> {
  // A README fetched from a subdirectory (a monorepo holding several
  // projects) has relative links resolved against that subdirectory, not
  // the repo root.
  const prefix = path ? `${path.replace(/^\/|\/$/g, "")}/` : "";

  const rewriteUrls = () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img" && typeof node.properties.src === "string") {
        node.properties.src = resolveRelative(
          node.properties.src,
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${prefix}`
        );
      }
      if (node.tagName === "a" && typeof node.properties.href === "string") {
        node.properties.href = resolveRelative(
          node.properties.href,
          `https://github.com/${owner}/${repo}/blob/${branch}/${prefix}`
        );
      }
    });
  };

  const stripDuplicateH1 = () => (tree: Root) => {
    const first = tree.children.find((n) => n.type === "element") as Element | undefined;
    if (first && first.tagName === "h1") {
      const text = extractText(first).toLowerCase().trim();
      if (text === repo.toLowerCase() || text === repo.replace(/[-_]/g, " ").toLowerCase()) {
        tree.children.splice(tree.children.indexOf(first), 1);
      }
    }
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "width", "height"],
        code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
      },
    })
    .use(rewriteUrls)
    .use(stripDuplicateH1)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

function resolveRelative(url: string, base: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith("#") || url.startsWith("mailto:")) {
    return url;
  }
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function extractText(node: Element): string {
  return (node.children ?? [])
    .map((c) => ("value" in c ? c.value : "children" in c ? extractText(c as Element) : ""))
    .join("");
}
