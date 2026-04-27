import Sidebar         from '@/components/layout/Sidebar'
import TopBar          from '@/components/layout/TopBar'
import GlobalDashboard from '@/components/dashboard/GlobalDashboard'

export default async function RestaurantPage({ params }) {
  const { id } = await params

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* page-shell handles responsive margin-left for all breakpoints */}
      <div className="flex-1 flex flex-col page-shell">
        <TopBar title="Restaurant Dashboard" subtitle="Deep-dive analytics for this venue" />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <GlobalDashboard publicId={id} />
        </main>
      </div>
    </div>
  )
}