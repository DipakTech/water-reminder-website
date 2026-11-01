import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4180);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ttf': 'font/ttf', '.json': 'application/json' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/config.js') {
      const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
      response.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' });
      response.end(`window.WATER_SITE = ${JSON.stringify(config)};`); return;
    }
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.')) || relative.startsWith('node_modules') || relative.startsWith('scripts') || !await stat(filename).then(s => s.isFile()).catch(() => false)) {
      response.writeHead(404, { 'Content-Type': types['.html'] }); response.end(await readFile(path.join(root, '404.html'))); return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(filename));
  } catch { response.writeHead(400); response.end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`Water Reminder landing page: http://127.0.0.1:${port}`));
