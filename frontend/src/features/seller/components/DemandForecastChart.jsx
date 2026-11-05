export function DemandForecastChart({ forecast }) {
  const history = forecast.history || []
  const predicted = forecast.predicted || []
  const series = [...history, ...predicted]
  if (!series.length) return <p>No forecast series available.</p>
  const max = Math.max(1, ...series.map((p) => p.units))
  const x = (index) => 40 + (index * 720) / Math.max(1, series.length - 1)
  const y = (value) => 175 - (value * 145) / max
  const points = (values, offset) =>
    values.map((p, index) => `${x(index + offset)},${y(p.units)}`).join(' ')
  const future = history.length ? [history.at(-1), ...predicted] : predicted
  return (
    <figure className="forecast-chart">
      <figcaption>
        Historical demand <span>Predicted demand (dashed)</span>
      </figcaption>
      <svg
        viewBox="0 0 800 210"
        role="img"
        aria-label={`Demand in packs. Historical and predicted series, maximum ${max} packs.`}
      >
        <text x="5" y="30">
          {max}
        </text>
        <text x="15" y="180">
          0
        </text>
        {[30, 78, 126, 175].map((v) => (
          <line key={v} x1="40" x2="760" y1={v} y2={v} stroke="#e4ddd3" />
        ))}
        <polyline
          points={points(history, 0)}
          fill="none"
          stroke="#a0522d"
          strokeWidth="3"
        />
        <polyline
          points={points(future, Math.max(0, history.length - 1))}
          fill="none"
          stroke="#627d3d"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
        {series.map((point, index) => (
          <text
            key={point.period}
            x={x(index)}
            y="200"
            textAnchor="middle"
            className="forecast-period"
          >
            {point.period}
          </text>
        ))}
      </svg>
      <details>
        <summary>View demand data</summary>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Packs</th>
              <th>Series</th>
            </tr>
          </thead>
          <tbody>
            {series.map((p, index) => (
              <tr key={index}>
                <td>{p.period}</td>
                <td>{p.units}</td>
                <td>{index < history.length ? 'Historical' : 'Predicted'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
