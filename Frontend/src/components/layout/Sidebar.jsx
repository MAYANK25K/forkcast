'use client'
import { useState }       from 'react'
import Link               from 'next/link'
import { usePathname }    from 'next/navigation'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Trophy,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/',            icon: LayoutDashboard, label: 'Overview'    },
  { href: '/restaurants', icon: UtensilsCrossed, label: 'Restaurants' },
  { href: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
]

export default function Sidebar() {
  const pathname   = usePathname()
  const [expanded, setExpanded] = useState(false)

  // On tablet (sm < md): sidebar is an icon-rail unless user expands it.
  // On desktop (md+): always full-width, no toggle.
  // On mobile (< sm): sidebar is hidden; bottom tab bar takes over.

  // Whether labels should show: desktop always, tablet only when expanded
  const showLabels = expanded // desktop is handled via md: classes below

  return (
    <>
      {/* ── Sidebar: hidden on mobile, icon-rail on tablet, full on desktop ── */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-100 overflow-hidden',
          'transition-[width] duration-200 ease-in-out',
          'hidden sm:flex',
          // tablet: icon-rail (56px) unless expanded
          !expanded ? 'sm:w-14 md:w-[var(--sidebar-w)]' : 'sm:w-[var(--sidebar-w)]',
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 py-5 border-b border-slate-700/50 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
            F
          </span>
          {/* FIX: use w-0 + overflow-hidden instead of just opacity-0 so collapsed text
              takes zero layout space and doesn't cause horizontal overflow or push icons */}
          <span className={clsx(
            'text-white text-lg font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-200',
            showLabels ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-auto md:opacity-100',
          )}>
            Forkcast
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-1.5 py-4 space-y-0.5 overflow-hidden">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                )}
              >
                <Icon size={17} className="shrink-0" />
                {/* FIX: same w-0 trick so collapsed label takes zero space */}
                <span className={clsx(
                  'flex-1 whitespace-nowrap overflow-hidden transition-all duration-200',
                  showLabels ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-auto md:opacity-100',
                )}>
                  {label}
                </span>
                {isActive && (
                  <ChevronRight size={13} className={clsx(
                    'shrink-0 opacity-50 transition-all duration-200',
                    showLabels ? 'block' : 'hidden md:block',
                  )} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Toggle (tablet only — hidden on desktop) */}
        <div className="md:hidden px-1.5 py-3 border-t border-slate-700/50">
          <button
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Collapse' : 'Expand'}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {expanded
              ? <PanelLeftClose size={17} className="shrink-0" />
              : <PanelLeftOpen  size={17} className="shrink-0" />
            }
            <span className={clsx(
              'text-sm whitespace-nowrap overflow-hidden transition-all duration-200',
              expanded ? 'w-auto opacity-100' : 'w-0 opacity-0',
            )}>
              Collapse
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-700/50 overflow-hidden">
          <p className={clsx(
            'text-xs text-slate-500 whitespace-nowrap overflow-hidden transition-all duration-200',
            showLabels ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-auto md:opacity-100',
          )}>
            Forkcast v1.0
          </p>
          <p className={clsx(
            'text-xs text-slate-600 mt-0.5 whitespace-nowrap overflow-hidden transition-all duration-200',
            showLabels ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-auto md:opacity-100',
          )}>
            Analytics Platform
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (< sm only) ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/60 flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-colors',
                isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-200',
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}