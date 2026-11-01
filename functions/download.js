// The app archive lives in R2, never in this repository or the Pages assets.
const key = 'releases/2.0.0/Water-Reminder-2.0.0-Windows.zip';

export async function onRequest({ request, env }) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  const object = request.method === 'HEAD' ? await env.DOWNLOADS.head(key) : await env.DOWNLOADS.get(key);
  if (!object) return new Response('This release is not available yet.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="Water-Reminder-2.0.0-Windows.zip"',
    'Content-Length': String(object.size),
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    ETag: object.httpEtag,
  });
  if (request.headers.get('If-None-Match') === object.httpEtag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
