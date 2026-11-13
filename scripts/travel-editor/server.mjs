// Local-only editor for the /travel page. No dependencies, never deployed.
//   npm run travel           → http://localhost:5174
// Photos are saved to public/travel/, place data to lib/content/static/travel.json.
// Commit both and push; the site rebuilds with them.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const DATA_FILE = path.join(ROOT, "lib/content/static/travel.json");
const PHOTO_DIR = path.join(ROOT, "public/travel");
const PORT = +process.env.PORT || 5174;
const MAX_UPLOAD = 40 * 1024 * 1024;
const OWNER_SLUG = "sahil-sanghvi";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error("Upload too large"), { code: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function uniqueName(file) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  let candidate = file;
  for (let n = 2; fs.existsSync(path.join(PHOTO_DIR, candidate)); n++) candidate = `${base}-${n}${ext}`;
  return candidate;
}

// "/travel/x.jpg" → absolute path inside public/travel, or null if it escapes.
function photoPath(src) {
  const name = path.basename(decodeURIComponent(String(src || "")));
  if (!name || name.startsWith(".")) return null;
  return path.join(PHOTO_DIR, name);
}

const readData = () => (fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) : []);
function writeData(stops) {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(stops, null, 2) + "\n");
  fs.renameSync(tmp, DATA_FILE);
}

/**
 * Renames every photo to sahil-sanghvi-<place>-<n>.jpg — the file name is one
 * of the signals Google Images uses, and "IMG_4821.jpg" says nothing.
 * Two passes through temporary names so swaps can't collide.
 */
function tidyFilenames() {
  const stops = readData();
  const moves = [];
  const taken = new Set();
  for (const s of stops) {
    const place = slugify(s.slug || s.name) || "travel";
    (s.photos || []).forEach((p, i) => {
      const from = photoPath(p.src);
      if (!from || !fs.existsSync(from)) return;
      let name = `${OWNER_SLUG}-${place}-${i + 1}${path.extname(from).toLowerCase() || ".jpg"}`;
      for (let n = 2; taken.has(name); n++) name = `${OWNER_SLUG}-${place}-${i + 1}-${n}.jpg`;
      taken.add(name);
      if (path.basename(from) !== name) moves.push({ p, from, to: path.join(PHOTO_DIR, name), name });
    });
  }
  // Any file already sitting at a target name that isn't moving out of the way would be clobbered.
  const leaving = new Set(moves.map((m) => m.from));
  for (const m of moves) {
    if (fs.existsSync(m.to) && !leaving.has(m.to)) {
      throw new Error(`${m.name} already exists and isn't one of the photos being renamed`);
    }
  }
  for (const m of moves) {
    m.tmp = m.from + ".tidy-tmp";
    fs.renameSync(m.from, m.tmp);
  }
  for (const m of moves) {
    fs.renameSync(m.tmp, m.to);
    m.p.src = `/travel/${m.name}`;
  }
  writeData(stops);
  return { stops, renamed: moves.length };
}

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  if (p === "/api/stops" && req.method === "GET") return send(res, 200, readData());

  if (p === "/api/stops" && req.method === "PUT") {
    const stops = JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString("utf8"));
    if (!Array.isArray(stops)) return send(res, 400, { error: "Expected an array" });
    writeData(stops);
    return send(res, 200, { ok: true, count: stops.length });
  }

  if (p === "/api/upload" && req.method === "POST") {
    const original = url.searchParams.get("name") || "photo.jpg";
    const ext = path.extname(original).toLowerCase() || ".jpg";
    if (!TYPES[ext] || ext === ".html" || ext === ".json") return send(res, 400, { error: `Unsupported file type ${ext}` });
    fs.mkdirSync(PHOTO_DIR, { recursive: true });
    const base = slugify(path.basename(original, path.extname(original))) || "photo";
    const file = uniqueName(`${OWNER_SLUG}-${base}${ext}`);
    fs.writeFileSync(path.join(PHOTO_DIR, file), await readBody(req, MAX_UPLOAD));
    return send(res, 200, { src: `/travel/${file}` });
  }

  if (p === "/api/file" && req.method === "DELETE") {
    const abs = photoPath(url.searchParams.get("src"));
    if (!abs) return send(res, 400, { error: "Can only delete files in public/travel/" });
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
    return send(res, 200, { ok: true });
  }

  if (p === "/api/tidy" && req.method === "POST") return send(res, 200, tidyFilenames());

  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method not allowed" });

  if (p === "/" || p === "/editor" || p === "/index.html") {
    return send(res, 200, fs.readFileSync(path.join(HERE, "index.html")), TYPES[".html"]);
  }
  if (p.startsWith("/travel/")) {
    const abs = photoPath(p.slice("/travel/".length));
    if (abs && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      res.writeHead(200, { "Content-Type": TYPES[path.extname(abs).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
      return fs.createReadStream(abs).pipe(res);
    }
  }
  return send(res, 404, "Not found", "text/plain");
}

http
  .createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) send(res, err.code === 413 ? 413 : 500, { error: err.message });
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`\n  Travel editor:  http://localhost:${PORT}`);
    console.log(`  Writes:         lib/content/static/travel.json + public/travel/`);
    console.log(`  Preview:        run \`npm run dev\` too, then open http://localhost:3000/travel\n`);
  });
