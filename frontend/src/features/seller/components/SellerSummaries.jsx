import { money } from '../../catalogue/api'
export function SellerOrdersSummary({ orders, reason, isDemo = false }) {
  return (
    <section className="market-panel" id="orders">
      <p className="market-eyebrow">Assigned suborders</p>
      <h2>Orders</h2>
      {orders?.length > 0 && (
        <p>
          {orders.length} assigned suborder{orders.length === 1 ? '' : 's'} ·{' '}
          {orders.reduce((total, order) => total + order.quantity, 0)} packs
          {orders[0].shipping_minor != null && (
            <> · seller shipping {money(orders[0].shipping_minor)}</>
          )}
        </p>
      )}
      {isDemo && (
        <span className="market-badge">
          DEMO DATA · Read-only sample orders
        </span>
      )}
      {orders == null ? (
        <div className="seller-empty">
          <span aria-hidden="true">◇</span>
          <h3>Order summary unavailable</h3>
          <p>{reason || 'Order data is not connected.'}</p>
          <small>
            Payment and fulfillment workflows are outside this phase.
          </small>
        </div>
      ) : orders.length === 0 ? (
        <p>No assigned orders.</p>
      ) : (
        orders.map((order) => (
          <div className="seller-order" key={order.id}>
            <div className="seller-row">
              <div>
                <strong>{order.reference}</strong>
                <p>
                  {order.buyer_total_minor != null && (
                    <>Buyer order {money(order.buyer_total_minor)} · </>
                  )}
                  Seller portion {money(order.seller_total_minor)}
                </p>
              </div>
              <div>
                <strong>{order.quantity} packs</strong>
                <p>{order.product_name}</p>
              </div>
            </div>
            <div className="seller-row">
              <div>
                <strong>Payment</strong>
                <p>
                  {isDemo
                    ? 'DEMO DATA · Simulated status, no live settlement'
                    : 'Read-only payment status'}
                </p>
              </div>
              <div>
                <strong>{order.payment_status}</strong>
                <p>{order.updated_at}</p>
              </div>
            </div>
            <div className="seller-row">
              <div>
                <strong>Fulfillment</strong>
                <p>
                  {isDemo
                    ? 'DEMO DATA · Simulated carrier event'
                    : 'Read-only fulfillment status'}
                </p>
              </div>
              <div>
                <strong>{order.fulfillment_status}</strong>
                <p>{order.estimated_transit}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  )
}
export function SellerInventorySummary({ inventory = [], isDemo = false }) {
  return (
    <section className="market-panel" id="inventory">
      <p className="market-eyebrow">Own stock & listing states</p>
      <h2>Inventory</h2>
      {isDemo && <span className="market-badge">DEMO DATA · Sample stock</span>}
      <p>
        {inventory.filter((p) => p.approved).length} approved products ·
        Read-only
      </p>
      {inventory.length === 0 ? (
        <div className="seller-empty">
          <h3>No products yet</h3>
          <p>
            Your products will appear here when catalogue records are available.
          </p>
        </div>
      ) : (
        inventory.map((product) => (
          <article className="seller-row" key={product.id}>
            <div>
              <h3>{product.name}</h3>
              {product.variants.map((v) => (
                <p key={v.id}>
                  {v.pack} · {money(v.price_minor, product.currency)} ·{' '}
                  {v.stock} packs{' '}
                  {v.stock < v.restock_threshold && (
                    <span className="market-badge">
                      Low stock · threshold {v.restock_threshold}
                    </span>
                  )}
                </p>
              ))}
            </div>
            <span className={`market-badge ${product.approved ? 'green' : ''}`}>
              {!product.active
                ? 'Inactive'
                : product.approved
                  ? 'Approved'
                  : 'Pending'}
            </span>
          </article>
        ))
      )}
    </section>
  )
}
