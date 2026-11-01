import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
for (const [key, variable] of Object.entries({ downloadUrl: 'DOWNLOAD_URL', repositoryUrl: 'REPOSITORY_URL', siteUrl: 'SITE_URL' })) {
  if (process.env[variable]) config[key] = process.env[variable];
  if (config[key]) {
    const url = new URL(config[key]);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`${key} must be a public HTTPS URL without credentials.`);
  }
}
if (process.env.REQUIRE_DOWNLOAD === 'true' && !config.downloadUrl) throw new Error('Set DOWNLOAD_URL to the public R2 release URL before production deployment.');
await mkdir(destination, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', '_headers', '404.html']) await cp(path.join(root, file), path.join(destination, file));
await cp(path.join(root, 'assets'), path.join(destination, 'assets'), { recursive: true });
await writeFile(path.join(destination, 'config.js'), `window.WATER_SITE = ${JSON.stringify(config)};\n`);
if (config.siteUrl) {
  const site = new URL(config.siteUrl).origin;
  let html = await readFile(path.join(destination, 'index.html'), 'utf8');
  html = html.replace('<meta property="og:image" content="/assets/screenshots/overview.webp">', `<meta property="og:image" content="${site}/assets/screenshots/overview.webp">\n  <meta property="og:url" content="${site}/">\n  <link rel="canonical" href="${site}/">`);
  await writeFile(path.join(destination, 'index.html'), html);
  await writeFile(path.join(destination, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
  await writeFile(path.join(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url></urlset>\n`);
} else await writeFile(path.join(destination, 'robots.txt'), 'User-agent: *\nAllow: /\n');
console.log(`Built static landing page: ${destination}\nDownload: ${config.downloadUrl || 'not yet published'}`);
