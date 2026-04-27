'use client'
import { format, parseISO } from 'date-fns'
import { Clock } from 'lucide-react'
import { clsx } from 'clsx'

// API fields: date (YYYY-MM-DD), peak_hour (0-23 int), order_count (int)

function fmtHour(h) {
  if (h === 0)  return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function heatCls(count, max) {
  if (max === 0) return 'bg-stone-100 text-stone-300'
  const r = count / max
  if (r >= 0.8) return 'bg-teal-600 text-white'
  if (r >= 0.6) return 'bg-teal-400 text-white'
  if (r >= 0.4) return 'bg-teal-200 text-teal-900'
  if (r >= 0.2) return 'bg-teal-100 text-teal-700'
  return 'bg-stone-100 text-stone-400'
}

export default function PeakHourChart({ data = [], isLoading }) {
  const maxCount = Math.max(...data.map(d => d.order_count ?? 0), 0)

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Clock size={13} className="text-amber-600" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">Peak Hour per Day</h3>
          <p className="text-xs text-slate-400">Busiest hour (most orders)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-300 text-xs">No data for the selected period</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {data.map(row => (
            <div key={row.date} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24 shrink-0">
                {row.date ? format(parseISO(row.date), 'EEE, MMM d') : '—'}
              </span>
              <div className={clsx(
                'flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold',
                heatCls(row.order_count, maxCount)
              )}>
                <span>{fmtHour(row.peak_hour)}</span>
                <span className="opacity-70 font-normal">{row.order_count} orders</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <span className="text-xs text-slate-400 mr-1">Less</span>
          {['bg-stone-100','bg-teal-100','bg-teal-200','bg-teal-400','bg-teal-600'].map(c => (
            <span key={c} className={clsx('w-4 h-4 rounded-sm', c)} />
          ))}
          <span className="text-xs text-slate-400 ml-1">More</span>
        </div>
      )}
    </div>
  )
}