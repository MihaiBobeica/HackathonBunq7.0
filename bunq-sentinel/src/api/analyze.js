import { apiPostForm } from './client';

/**
 * @param {File[]} files
 * @param {string} text
 * @param {{iban?: string, amount?: string, description?: string}} paymentContext
 */
export function analyzeContext(files, text, paymentContext = {}) {
  const fd = new FormData();
  fd.append('text', text || '');
  fd.append('iban', paymentContext.iban || '');
  fd.append('amount', paymentContext.amount || '');
  fd.append('description', paymentContext.description || '');
  for (const f of files || []) {
    if (f instanceof File) fd.append('files', f);
  }
  return apiPostForm('/api/analyze', fd);
}
