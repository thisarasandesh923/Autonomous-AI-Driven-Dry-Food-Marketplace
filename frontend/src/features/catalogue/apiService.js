import { api } from '../../api/client'
// Real HTTP contract. Never imports fixtures or falls back to demonstration data.
export const httpCatalogue = {
  list: (query, signal) => api.get(`/products?${query}`, { signal }),
  detail: (id, destination, signal) =>
    api.get(`/products/${encodeURIComponent(id)}?destination=${destination}`, {
      signal,
    }),
}
