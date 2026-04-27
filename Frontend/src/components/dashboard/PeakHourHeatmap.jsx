'use client'
import { clsx } from 'clsx'

// Hours we show on the Y-axis (10am to 11pm)
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Convert 24h to readable: 13 → "1 PM", 10 → "10 AM"
function formatHour(h) {
  if (h === 12) return '12 PM'
  if (h < 12)  return `${h} AM`
  return `${h - 12} PM`
}

// Given a count and the max count in the dataset,
// return a Tailwind background class on a teal intensity scale
function intensityClass(count, max) {
  if (!count || max === 0) return 'bg-stone-50'
  const ratio = count / max
  if (ratio > 0.85) return 'bg-teal-600 text-white'
  if (ratio > 0.65) return 'bg-teal-400 text-white'
  if (ratio > 0.45) return 'bg-teal-200 text-teal-900'
  if (ratio > 0.25) return 'bg-teal-100 text-teal-800'
  return 'bg-teal-50 text-teal-600'
}

export default function PeakHourHeatmap({ data = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-36 bg-stone-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-28 bg-stone-100 rounded animate-pulse mb-4" />
        <div className="h-52 bg-stone-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  // The API returns rows like:
  // [{ day_of_week: 1, hour: 19, order_count: 14 }, ...]
  // day_of_week: 1=Mon … 7=Sun  (matches Laravel's ISODOW)
  // We build a lookup map: grid[dayIndex][hour] = count
  const grid = {}
  let maxCount = 0

  data.forEach(row => {
    // Convert 1-7 → 0-6 index to match DAYS array
    const dayIdx = (Number(row.day_of_week) - 1)
    const hour   = Number(row.hour)
    const count  = Number(row.order_count ?? 0)

    if (!grid[dayIdx]) grid[dayIdx] = {}
    grid[dayIdx][hour] = count
    if (count > maxCount) maxCount = count
  })

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Peak hours per day
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Order intensity by hour — darker = busier
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[480px]">

          {/* Day headers */}
          <div className="flex mb-1.5 ml-12">
            {DAYS.map(day => (
              <div
                key={day}
                className="flex-1 text-center text-[10px] font-medium text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="flex items-center mb-1">
              {/* Hour label on the left */}
              <div className="w-12 shrink-0 text-[10px] text-slate-400 text-right pr-2">
                {formatHour(hour)}
              </div>

              {/* One cell per day */}
              {DAYS.map((_, dayIdx) => {
                const count = grid[dayIdx]?.[hour] ?? 0
                return (
                  <div
                    key={dayIdx}
                    title={`${DAYS[dayIdx]} ${formatHour(hour)}: ${count} orders`}
                    className={clsx(
                      'flex-1 mx-0.5 h-6 rounded-md flex items-center justify-center',
                      'text-[9px] font-medium transition-all cursor-default',
                      intensityClass(count, maxCount)
                    )}
                  >
                    {/* Only show the number if there are orders in this cell */}
                    {count > 0 ? count : ''}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-12">
            <span className="text-[10px] text-slate-400">Low</span>
            {['bg-teal-50', 'bg-teal-100', 'bg-teal-200', 'bg-teal-400', 'bg-teal-600'].map(c => (
              <div key={c} className={clsx('w-5 h-3 rounded', c)} />
            ))}
            <span className="text-[10px] text-slate-400">High</span>
          </div>

        </div>
      </div>
    </div>
  )
}