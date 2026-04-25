import { apiGet } from './client';

function parseAmount(amount) {
  if (typeof amount === 'number') return amount;
  if (!amount) return 0;
  const cleaned = String(amount).replace(/[^0-9.,-]/g, '');
  // European format: 1.500,00 -> 1500.00
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function ibanCheck(iban, amount) {
  return apiGet('/api/iban-check', { iban, amount: parseAmount(amount) });
}
