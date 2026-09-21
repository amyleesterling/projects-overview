import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const basePath = "/projects-overview";
const port = Number(process.env.PORT || 5190);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".txt":"text/plain", ".png":"image/png", ".webp":"image/webp", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".glb":"model/gltf-binary" };

createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, "http://localhost");
    if (pathname === "/" || pathname === basePath) {
      response.writeHead(302, { location: `${basePath}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${basePath}/`)) throw new Error("Outside base path");
    let file = resolve(root, `.${decodeURIComponent(pathname.slice(basePath.length))}`);
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside export");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Static export: http://127.0.0.1:${port}${basePath}/`));
