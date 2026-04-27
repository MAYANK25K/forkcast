import { clsx } from 'clsx'

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  className,
}) {
  return (
    <div
      className={clsx(
        'card px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-3 animate-fade-up min-w-0',
        accent && 'border-teal-200 bg-gradient-to-br from-teal-50 to-white',
        className,
      )}
    >
      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">
          {label}
        </p>
        {Icon && (
          <span className={clsx(
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
            accent ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-slate-500',
          )}>
            <Icon size={15} />
          </span>
        )}
      </div>

      {/* Value — FIX: was text-3xl which overflows in narrow containers (tablet sidebar layout,
          nested grid in overview). Use fluid sizing: text-2xl base, text-3xl at sm+.
          Also added break-all so very long numbers wrap rather than overflow. */}
      <div className="min-w-0">
        <p className={clsx(
          'text-2xl sm:text-3xl font-semibold leading-none break-all',
          accent ? 'text-teal-700' : 'text-slate-900',
        )}>
          {value ?? '—'}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 mt-1.5 truncate">{sub}</p>
        )}
      </div>
    </div>
  )
}