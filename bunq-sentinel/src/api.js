const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

async function jsonFetch(path, init) {
  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const err = new Error(body?.detail || body?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const apiBase = API_BASE;

export function getBunqStatus() {
  return jsonFetch('/bunq/status');
}

export function getAccounts() {
  return jsonFetch('/bunq/accounts');
}

export function getPayments(accountId, count = 25) {
  return jsonFetch(`/bunq/accounts/${accountId}/payments?count=${count}`);
}

export function getCards() {
  return jsonFetch('/bunq/cards');
}

export function createBunqPayment(payload) {
  return jsonFetch('/bunq/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function cancelDraftPayment(accountId, draftId) {
  return jsonFetch(`/bunq/accounts/${accountId}/draft-payments/${draftId}/cancel`, {
    method: 'POST',
  });
}

export function sandboxFund(accountId, amount = '500.00') {
  return jsonFetch(`/bunq/accounts/${accountId}/sandbox-fund?amount=${encodeURIComponent(amount)}`, {
    method: 'POST',
  });
}
