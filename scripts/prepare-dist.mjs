import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "out");
const distDir = resolve(root, "dist");
const serverDir = resolve(distDir, "server");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function walkFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walkFiles(path) : [path];
  });
}

function routePath(filePath) {
  return `/${relative(outDir, filePath).split(sep).join("/")}`;
}

function extensionlessPath(pathname) {
  if (!pathname.endsWith(".html")) {
    return null;
  }

  const withoutExtension = pathname.slice(0, -5);
  return withoutExtension === "/index" ? "/" : withoutExtension;
}

if (!existsSync(outDir)) {
  throw new Error("Expected Next static export output at ./out.");
}

rmSync(distDir, { force: true, recursive: true });
mkdirSync(serverDir, { recursive: true });
mkdirSync(resolve(distDir, ".openai"), { recursive: true });

const assets = {};

for (const filePath of walkFiles(outDir)) {
  const pathname = routePath(filePath);
  const extension = extname(filePath);
  const contentType =
    mimeTypes[extension] ?? "application/octet-stream";

  assets[pathname] = {
    body: readFileSync(filePath).toString("base64"),
    contentType,
    encoded: true
  };

  const alias = extensionlessPath(pathname);
  if (alias) {
    assets[alias] = assets[pathname];
  }
}

const worker = `const assets = ${JSON.stringify(assets)};

function lookup(pathname) {
  if (assets[pathname]) return assets[pathname];
  if (assets[pathname + ".html"]) return assets[pathname + ".html"];
  if (pathname.endsWith("/") && assets[pathname + "index.html"]) {
    return assets[pathname + "index.html"];
  }
  return assets["/404.html"] || assets["/"];
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = lookup(url.pathname);
    const bytes = Uint8Array.from(atob(asset.body), (char) => char.charCodeAt(0));

    return new Response(bytes, {
      headers: {
        "content-type": asset.contentType,
        "cache-control": "public, max-age=60"
      },
      status: asset === assets["/404.html"] ? 404 : 200
    });
  }
};
`;

writeFileSync(resolve(serverDir, "index.js"), worker);
cpSync(
  resolve(root, ".openai", "hosting.json"),
  resolve(distDir, ".openai", "hosting.json")
);
