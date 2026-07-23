import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "out");
const distDir = resolve(root, "dist");
const publicDir = resolve(distDir, "public");
const serverDir = resolve(distDir, "server");

if (!existsSync(outDir)) {
  throw new Error("Expected Next static export output at ./out.");
}

rmSync(distDir, { force: true, recursive: true });
mkdirSync(publicDir, { recursive: true });
mkdirSync(serverDir, { recursive: true });

cpSync(outDir, publicDir, { recursive: true });
cpSync(resolve(root, ".openai"), resolve(distDir, ".openai"), { recursive: true });

writeFileSync(
  resolve(serverDir, "index.js"),
  `function withHtmlExtension(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname.endsWith("/")) return pathname + "index.html";
  if (pathname.includes(".")) return pathname;
  return pathname + ".html";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const directResponse = await env.ASSETS.fetch(request);

    if (directResponse.status !== 404) {
      return directResponse;
    }

    const htmlUrl = new URL(request.url);
    htmlUrl.pathname = withHtmlExtension(url.pathname);

    return env.ASSETS.fetch(new Request(htmlUrl, request));
  }
};
`
);
