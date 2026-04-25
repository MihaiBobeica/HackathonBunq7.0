import { apiGet } from './client';

export function fetchAccounts() {
  return apiGet('/api/accounts');
}
