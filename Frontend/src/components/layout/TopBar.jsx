// TopBar: sticky page header with title, subtitle and date.
// On mobile it sits flush (no sidebar margin), on tablet/desktop the
// parent div already applies marginLeft via the --sidebar-w / --sidebar-w-sm
// CSS variables so TopBar itself needs no layout changes.
export default function TopBar({ title, subtitle }) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  })

  // Short date for mobile (e.g. "Apr 24, 2026")
  const todayShort = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white/90 backdrop-blur-sm border-b border-stone-200/80">
      {/* Left: title + subtitle */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right: date badge */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Full date on sm+, short date on mobile */}
        <span className="text-xs text-slate-500 bg-stone-100 px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200">
          <span className="hidden sm:inline">{today}</span>
          <span className="sm:hidden">{todayShort}</span>
        </span>
      </div>
    </header>
  )
}