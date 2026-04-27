import Sidebar         from '@/components/layout/Sidebar'
import TopBar          from '@/components/layout/TopBar'
import RestaurantGrid  from '@/components/catalog/RestaurantGrid'
import { UtensilsCrossed } from 'lucide-react'

export default function RestaurantsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* page-shell handles responsive margin-left for all breakpoints */}
      <div className="flex-1 flex flex-col page-shell">
        <TopBar
          title="Restaurants"
          subtitle="Browse, search and sort all venues"
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={16} className="text-teal-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                All restaurants
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any card to open its full analytics dashboard
              </p>
            </div>
          </div>

          <RestaurantGrid />
        </main>
      </div>
    </div>
  )
}