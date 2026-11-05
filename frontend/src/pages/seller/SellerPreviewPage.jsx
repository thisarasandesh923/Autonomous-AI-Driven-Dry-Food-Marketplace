import { SellerDashboardPage } from './SellerDashboardPage'
import { demoSellerIdentity } from '../../mocks/data'
export default function SellerPreviewPage() {
  return <SellerDashboardPage preview previewIdentity={demoSellerIdentity} />
}
