import { BuyerLayout } from '../layouts/BuyerLayout'
import { Link } from '../components/Link'
export function NotFoundPage() {
  return (
    <BuyerLayout>
      <h1>That page isn’t in the pantry.</h1>
      <p>The address may have changed.</p>
      <Link className="market-primary" href="/products">
        Browse the pantry
      </Link>
    </BuyerLayout>
  )
}
