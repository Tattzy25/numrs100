import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { method, url, query, body } = req;
  const apiKey = process.env.VITE_DEEPL_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'DeepL API key not set in environment.' });
    return;
  }

  // Determine DeepL endpoint and method
  const { slug } = query;
  let deeplPath = Array.isArray(slug) ? slug.join('/') : slug;
  if (deeplPath) {
    deeplPath = `/${deeplPath}`;
  }

  let deeplUrl = `https://api.deepl.com/v2${deeplPath}`;

  // Forward query params for GET, excluding the 'slug' parameter
  if (method === 'GET' && Object.keys(query).length) {
    const filteredQuery = { ...query };
    delete filteredQuery.slug;
    const params = new URLSearchParams(filteredQuery).toString();
    if (params) {
      deeplUrl += `?${params}`;
    }
  }

  // Prepare headers
  const headers = {
    'Authorization': `DeepL-Auth-Key ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const deeplRes = await fetch(deeplUrl, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    const data = await deeplRes.json();
    if (!deeplRes.ok) {
      res.status(deeplRes.status).json({ error: data.message || data.error || 'DeepL API error', details: data });
      return;
    }
    res.status(deeplRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'DeepL proxy error' });
  }
}