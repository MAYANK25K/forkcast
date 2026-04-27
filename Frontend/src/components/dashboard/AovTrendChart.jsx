'use client'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { format, parseISO } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const aov = Number(payload[0]?.value ?? 0)
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1">
        {label ? format(parseISO(label), 'EEE, MMM d') : ''}
      </p>
      <p className="text-indigo-600 font-semibold text-sm">
        {aov.toLocaleString('en-US', {
          style: 'currency', currency: 'USD',
          minimumFractionDigits: 2,
        })}
      </p>
      <p className="text-slate-400 mt-0.5">Avg order value</p>
    </div>
  )
}

export default function AovTrendChart({ data = [], isLoading }) {
  // BUG FIX: The original mapped `row.order_date` — but DailyMetricResource
  // returns the field as `date` (aliased via `order_date AS date` in the SQL).
  // `row.order_date` was always undefined, making the entire chart render blank
  // with no X-axis labels and a flat line at zero.
  const chartData = data.map(row => ({
    date: row.date,              // ← was row.order_date (wrong, always undefined)
    aov:  Number(row.avg_order_value ?? 0),
  }))

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-36 bg-stone-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-24 bg-stone-100 rounded animate-pulse mb-4" />
        <div className="h-44 bg-stone-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Avg order value trend
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Daily AOV in dollars</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={d => {
              try { return format(parseISO(d), 'EEE') }
              catch { return d }
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={48}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="aov"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}