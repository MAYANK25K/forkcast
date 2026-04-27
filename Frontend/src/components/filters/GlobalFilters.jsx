'use client'
import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'

function hourOptions() {
  return Array.from({ length: 24 }, (_, h) => {
    let label
    if (h === 0)       label = '12 AM'
    else if (h === 12) label = '12 PM'
    else if (h < 12)   label = `${h} AM`
    else               label = `${h - 12} PM`
    return { value: h, label }
  })
}

const HOURS = hourOptions()

// Props:
//   onApply(filters) — { date_from?, date_to?, amount_min?, amount_max?, hour_from?, hour_to? }
//   onClear()        — resets all filters
export default function GlobalFilters({ onApply, onClear }) {
  const [open,      setOpen]      = useState(false)
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [hourFrom,  setHourFrom]  = useState('')
  const [hourTo,    setHourTo]    = useState('')

  const activeCount = [dateFrom, dateTo, amountMin, amountMax, hourFrom, hourTo].filter(Boolean).length

  function handleApply() {
    const filters = {}
    if (dateFrom)     filters.date_from  = dateFrom
    if (dateTo)       filters.date_to    = dateTo
    if (amountMin)    filters.amount_min = Number(amountMin)
    if (amountMax)    filters.amount_max = Number(amountMax)
    if (hourFrom !== '') filters.hour_from = Number(hourFrom)
    if (hourTo   !== '') filters.hour_to   = Number(hourTo)
    onApply(filters)
    setOpen(false)
  }

  function handleClear() {
    setDateFrom(''); setDateTo('')
    setAmountMin(''); setAmountMax('')
    setHourFrom(''); setHourTo('')
    onClear()
    setOpen(false)
  }

  const inputCls = 'text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 text-slate-700'

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Filter size={14} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
          {activeCount > 0 && (
            <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date range</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
              <div className="text-xs text-center text-slate-300">to</div>
              <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} className={inputCls} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order amount ($)</label>
              <input type="number" placeholder="Min (e.g. 10)" value={amountMin} min={0} onChange={e => setAmountMin(e.target.value)} className={inputCls} />
              <div className="text-xs text-center text-slate-300">to</div>
              <input type="number" placeholder="Max (e.g. 100)" value={amountMax} min={amountMin || 0} onChange={e => setAmountMax(e.target.value)} className={inputCls} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order hour</label>
              <select value={hourFrom} onChange={e => setHourFrom(e.target.value)} className={inputCls}>
                <option value="">From (any hour)</option>
                {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <div className="text-xs text-center text-slate-300">to</div>
              <select value={hourTo} onChange={e => setHourTo(e.target.value)} className={inputCls}>
                <option value="">To (any hour)</option>
                {HOURS.filter(h => hourFrom === '' || h.value >= Number(hourFrom)).map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button onClick={handleApply} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              Apply filters
            </button>
            {activeCount > 0 && (
              <button onClick={handleClear} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <X size={13} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}