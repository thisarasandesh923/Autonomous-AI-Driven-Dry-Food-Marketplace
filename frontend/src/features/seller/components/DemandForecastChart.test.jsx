import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { DemandForecastChart } from './DemandForecastChart'

it('labels historical/predicted demand and exposes the underlying data', async () => {
  render(
    <DemandForecastChart
      forecast={{
        history: [
          { period: '2026-W01', units: 3 },
          { period: '2026-W02', units: 5 },
        ],
        predicted: [{ period: '2026-W03', units: 6 }],
      }}
    />,
  )
  expect(screen.getByRole('img')).toHaveAccessibleName(
    /Historical and predicted series/,
  )
  await userEvent.click(screen.getByText('View demand data'))
  expect(screen.getByRole('table')).toBeVisible()
  expect(screen.getByRole('cell', { name: '2026-W03' })).toBeVisible()
  expect(screen.getByText('Predicted', { exact: true })).toBeVisible()
})

it('does not fabricate a chart when no series are supplied', () => {
  render(<DemandForecastChart forecast={{ history: [], predicted: [] }} />)
  expect(screen.getByText('No forecast series available.')).toBeVisible()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})
