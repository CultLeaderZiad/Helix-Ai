import { Skeleton } from '@/components/dashboard/ui'
import '@/components/dashboard/dash.css'

export default function DashboardLoading() {
  return (
    <div className="dash" data-theme="day" aria-busy="true">
      <div className="content">
        <Skeleton className="skel" />
        <div className="kpis">
          {[0, 1, 2, 3].map(item => (
            <div className="kpi" key={item}>
              <Skeleton />
              <div style={{ height: 28, marginTop: 16 }}><Skeleton /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
