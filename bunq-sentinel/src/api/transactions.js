import { apiGet } from './client';

export function fetchTransactions({ accountId, limit = 10 } = {}) {
  return apiGet('/api/transactions', { account_id: accountId, limit });
}
