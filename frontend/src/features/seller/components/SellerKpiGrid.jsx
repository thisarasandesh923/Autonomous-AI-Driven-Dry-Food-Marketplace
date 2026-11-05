import { money } from '../../catalogue/api'
export function SellerKpiGrid({ summary = {}, isDemo = false }) {
  const cards = [
    [
      'Own revenue',
      summary.revenue_minor == null
        ? 'Unavailable'
        : money(summary.revenue_minor),
      summary.revenue_minor == null
        ? 'Revenue reporting is not connected.'
        : isDemo
          ? 'DEMO DATA · 2 packs × $8.00. No live settlement.'
          : 'Seller revenue for the reporting period.',
    ],
    [
      'Open suborders',
      summary.open_suborders ?? 'Unavailable',
      summary.open_suborders == null
        ? 'Order reporting is not connected.'
        : isDemo
          ? 'DEMO DATA · 1 assigned suborder, 2 packs.'
          : 'Assigned suborders in the reporting period.',
    ],
    [
      'Low stock',
      summary.low_stock ?? 'Unavailable',
      'Products below their restock threshold.',
    ],
    [
      'Forecast error',
      summary.forecast_error == null
        ? 'Unavailable'
        : `${summary.forecast_error}%`,
      summary.forecast_error == null
        ? 'A measured forecast error is not available.'
        : isDemo
          ? 'DEMO DATA · Illustrative MAPE, not measured accuracy.'
          : 'MAPE for the supplied evaluation period.',
    ],
  ]
  return (
    <div className="seller-kpis">
      {cards.map(([label, value, note]) => (
        <article className="market-panel" key={label}>
          <h2>{label}</h2>
          {isDemo && <span className="market-badge">DEMO DATA</span>}
          <p
            className={`kpi-value ${typeof value === 'string' && value === 'Unavailable' ? 'unavailable-value' : ''}`}
          >
            {value}
          </p>
          <p>{note}</p>
        </article>
      ))}
    </div>
  )
}
