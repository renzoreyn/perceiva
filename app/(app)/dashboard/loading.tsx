export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl pb-8 animate-pulse">
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-xl"/>
          <div className="h-4 w-32 bg-muted rounded-lg"/>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-muted rounded-xl"/>
          <div className="h-8 w-28 bg-muted rounded-xl"/>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="h-28 bg-muted rounded-2xl"/>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-muted rounded-2xl"/>
        <div className="h-64 bg-muted rounded-2xl"/>
      </div>

      {/* main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-muted rounded-2xl"/>
          <div className="h-72 bg-muted rounded-2xl"/>
        </div>
        <div className="space-y-4">
          <div className="h-52 bg-muted rounded-2xl"/>
          <div className="h-40 bg-muted rounded-2xl"/>
          <div className="h-32 bg-muted rounded-2xl"/>
        </div>
      </div>
    </div>
  );
}
