import { DemandForecastChart } from './DemandForecastChart'
export function SellerForecastPanel({ forecast, reason }) {
  return (
    <section className="market-panel seller-forecast" id="forecasting">
      <p className="market-eyebrow">Demand forecasting</p>
      <h2>{forecast?.product_name || 'Plan your next harvest.'}</h2>
      {forecast ? (
        <>
          {forecast.is_demo && (
            <span className="market-badge">DEMO DATA · Synthetic forecast</span>
          )}
          <div className="forecast-facts">
            <div>
              History range<strong>{forecast.history_weeks} weeks</strong>
            </div>
            <div>
              Forecast period
              <strong>{forecast.horizon_weeks} weeks ahead</strong>
            </div>
            <div>
              Estimated units<strong>{forecast.estimated_units} packs</strong>
            </div>
            <div>
              Source<strong>{forecast.source}</strong>
            </div>
          </div>
          <DemandForecastChart forecast={forecast} />
          <div className="forecast-facts">
            <div>
              Error metric
              <strong>{forecast.error_metric || 'Not supplied'}</strong>
            </div>
            <div>
              Value
              <strong>
                {forecast.error_value == null
                  ? 'Not available'
                  : `${forecast.error_value}%`}
              </strong>
            </div>
            <div>
              Baseline<strong>{forecast.baseline || 'Not supplied'}</strong>
            </div>
            <div>
              Restock signal
              <strong>
                {forecast.is_demo
                  ? 'Illustrative only'
                  : 'See supplied recommendation'}
              </strong>
            </div>
          </div>
          <p>{forecast.summary}</p>
          <small>{forecast.note}</small>
          {forecast.recommendation && (
            <div className="market-notice">{forecast.recommendation}</div>
          )}
        </>
      ) : (
        <>
          <div className="forecast-facts">
            <div>
              History range<strong>Not available</strong>
            </div>
            <div>
              Forecast period<strong>Not available</strong>
            </div>
            <div>
              Estimated units<strong>—</strong>
            </div>
            <div>
              Source<strong>Not connected</strong>
            </div>
          </div>
          <div className="forecast-unavailable">
            <span aria-hidden="true">⌁</span>
            <h3>No demand forecast available</h3>
            <p>
              {reason || 'A forecasting data source has not been connected.'}
            </p>
            <small>
              No synthetic demand or accuracy figures are presented as business
              data.
            </small>
          </div>
          <div className="market-notice">
            Inventory thresholds are available above. Forecasting and automatic
            recommendations will be added in a future phase.
          </div>
        </>
      )}
    </section>
  )
}
