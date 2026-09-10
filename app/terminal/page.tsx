import { buildFilesystem } from "@/lib/terminal/build-fs";
import { Terminal } from "@/components/terminal/terminal";

export const revalidate = 3600;

export default async function TerminalPage() {
  const fs = await buildFilesystem();
  return <Terminal fs={fs} />;
}
