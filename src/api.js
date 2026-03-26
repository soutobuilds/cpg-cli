// src/api.js
// HTTP client for the CopyPasteGenius API
// All requests are authenticated via API key

const fetch = require('node-fetch');
const { getApiKey, getApiUrl } = require('./config');

async function request(method, path, body) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('Not authenticated. Run: cpg auth login');
    err.code = 'NOT_AUTHENTICATED';
    throw err;
  }

  const url = getApiUrl() + path;
  const opts = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

module.exports = {
  // Skills
  listSkills:  (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/api/skills${qs ? '?' + qs : ''}`);
  },
  getSkill:    (slug)        => request('GET',  `/api/skills?slug=${encodeURIComponent(slug)}`),
  runSkill:    (slug, vars)  => request('POST', '/api/skills', { slug, variables: vars }),

  // Packs
  listPacks:   ()            => request('GET',  '/api/packs'),
  getPack:     (slug)        => request('GET',  `/api/packs?slug=${encodeURIComponent(slug)}`),
  installPack: (slug)        => request('POST', '/api/packs', { slug }),
};
