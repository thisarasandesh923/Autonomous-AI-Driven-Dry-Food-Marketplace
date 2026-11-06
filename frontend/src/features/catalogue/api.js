import { demoEnabled } from '../../config/dataMode'
import { httpCatalogue } from './apiService'
export const catalogueApi = {
  list: async (query, signal) =>
    demoEnabled
      ? (await import('../../mocks/catalogueService')).demoCatalogue.list(
          query,
          signal,
        )
      : httpCatalogue.list(query, signal),
  detail: async (id, destination, signal) =>
    demoEnabled
      ? (await import('../../mocks/catalogueService')).demoCatalogue.detail(
          id,
          destination,
          signal,
        )
      : httpCatalogue.detail(id, destination, signal),
}
export const money = (minor, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    minor / 100,
  )
