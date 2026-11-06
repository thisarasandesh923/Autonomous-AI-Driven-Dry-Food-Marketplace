import { demoResponse } from './catalogueService'
import { makeDemoDashboard } from './data'
export const demoSellerService = {
  dashboard: (signal) => demoResponse(makeDemoDashboard(), signal),
}
