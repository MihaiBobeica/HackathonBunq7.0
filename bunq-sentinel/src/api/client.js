export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export function apiGet(path, params) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  return fetch(`${BACKEND_URL}${path}${qs}`).then(handle);
}

export function apiPostJson(path, body) {
  return fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle);
}

export function apiPostForm(path, formData) {
  return fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    body: formData,
  }).then(handle);
}
