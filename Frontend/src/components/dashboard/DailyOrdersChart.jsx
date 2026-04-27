'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ShoppingBag } from 'lucide-react'

// API field: order_count (integer)
// data: [{ date: "YYYY-MM-DD", order_count, revenue, avg_order_value }]

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-slate-700 pointer-events-none">
      <p className="font-semibold mb-0.5">{label ? format(parseISO(label), 'MMM d') : ''}</p>
      <p className="text-teal-300 font-bold text-sm">{payload[0]?.value} orders</p>
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

export default function DailyOrdersChart({ data = [], isLoading }) {
  const maxCount = Math.max(...data.map(d => d.order_count ?? 0), 0)

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
          <ShoppingBag size={13} className="text-teal-600" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">Daily Orders</h3>
          <p className="text-xs text-slate-400">Order count per day</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-end gap-2 px-2">
          {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-stone-200 rounded-t-md animate-pulse" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-slate-300 text-xs">No data for the selected period</div>
      ) : (
        <ResponsiveContainer width="100%" height={208}>
          <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={<XTick />} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<OrdersTooltip />} cursor={{ fill: '#f8fafc', radius: 6 }} />
            <Bar dataKey="order_count" radius={[5, 5, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.order_count === maxCount ? '#0d9488' : '#99f6e4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {!isLoading && data.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-stone-100">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" />Peak day</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-200 inline-block" />Other days</span>
        </div>
      )}
    </div>
  )
}