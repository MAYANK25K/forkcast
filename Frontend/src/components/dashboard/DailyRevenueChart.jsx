'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { format, parseISO } from 'date-fns'
import { DollarSign } from 'lucide-react'

// API field: revenue (float)
// data: [{ date: "YYYY-MM-DD", order_count, revenue, avg_order_value }]

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const fmt = Number(payload[0]?.value).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  })
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-slate-700 pointer-events-none">
      <p className="font-semibold mb-0.5">{label ? format(parseISO(label), 'MMM d') : ''}</p>
      <p className="text-teal-300 font-bold text-sm">{fmt}</p>
    </div>
  )
}

function XTick({ x, y, payload }) {
  if (!payload?.value) return null
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontFamily="inherit">
      {format(parseISO(payload.value), 'MMM d')}
    </text>
  )
}

function fmtY(v) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
}

export default function DailyRevenueChart({ data = [], isLoading }) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <DollarSign size={13} className="text-emerald-600" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">Daily Revenue</h3>
          <p className="text-xs text-slate-400">Revenue earned per day</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 px-2">
          <div className="w-full h-full bg-gradient-to-t from-stone-200 to-transparent rounded-md animate-pulse" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-slate-300 text-xs">No data for the selected period</div>
      ) : (
        <ResponsiveContainer width="100%" height={208}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={<XTick />} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtY} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
            <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#0d9488', strokeWidth: 1, strokeDasharray: '4 2' }} />
            <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}