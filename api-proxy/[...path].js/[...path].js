// api-proxy/[...path].js
// Vercel serverless catch-all that proxies requests under /api-proxy/... to
// Google Generative Language API (Gemini / text-bison / etc).
//
// Place this file at: /api-proxy/[...path].js in your repo.
//
// IMPORTANT:
// - Add GOOGLE_API_KEY (or Gemini_API_KEY) to Vercel env settings.
// - This function intentionally proxies JSON POST/GET requests and returns
//   the Google API's status and JSON body back to the client.
//
// Notes:
// - This is minimal and will forward request body and main headers (content-type).
// - Does NOT expose secrets to the browser (the key is only used server-side).

const KEY_FROM_ENV = process.env.GOOGLE_API_KEY || process.env.Gemini_API_KEY;

export default async function handler(req, res) {
  if (!KEY_FROM_ENV) {
    res.status(500).json({ error: 'Server error: GOOGLE_API_KEY (or Gemini_API_KEY) not set.' });
    return;
  }

  try {
    // req.query.path will be an array from the catch-all route.
    // Build the target path from it.
    // e.g. incoming path: /api-proxy/v1/models/text-bison-001:generate
    // -> pathParts = ['v1','models','text-bison-001:generate']
    const pathParts = req.query.path || [];
    const joinedPath = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');
    // Ensure there is a leading slash
    const pathSuffix = joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`;

    // Google generative language base
    const googleBase = 'https://generativelanguage.googleapis.com';

    // Build target URL. Google typically accepts:
    //  https://generativelanguage.googleapis.com/v1/models/<model>:generate?key=API_KEY
    // If the client included query string (e.g. ?foo=bar), we'll append it.
    const originalQuery = req.url.split('?')[1] || '';
    const connector = originalQuery ? '&' : '?';
    const targetUrl = `${googleBase}${pathSuffix}?key=${encodeURIComponent(KEY_FROM_ENV)}${originalQuery ? connector + originalQuery : ''}`;

    // Prepare fetch options
    const method = req.method || 'GET';
    const headers = { 'x-forwarded-for': req.headers['x-forwarded-for'] || '' };

    // Forward content-type if present
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    } else {
      headers['content-type'] = 'application/json';
    }

    // Don't forward Authorization or cookie headers from client
    // (we control auth server-side using the API key)

    const fetchOptions = {
      method,
      headers,
      // For GET we should not pass body
      body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(req.body)
    };

    // Use global fetch (available on Vercel Node 18+)
    const resp = await fetch(targetUrl, fetchOptions);

    // Stream back status and headers
    const respText = await resp.text();
    // Try to parse JSON, but if it's not JSON just send text
    let body;
    try {
      body = JSON.parse(respText);
      // Return JSON
      res.status(resp.status).json(body);
    } catch (err) {
      // Not JSON — return as text
      res.status(resp.status).setHeader('content-type', resp.headers.get('content-type') || 'text/plain');
      res.send(respText);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
}
