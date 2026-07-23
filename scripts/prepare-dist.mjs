import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "out");
const distDir = resolve(root, "dist");

if (!existsSync(outDir)) {
  throw new Error("Expected Next static export output at ./out.");
}

rmSync(distDir, { force: true, recursive: true });
cpSync(outDir, distDir, { recursive: true });
