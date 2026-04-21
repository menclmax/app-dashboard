function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function DashboardLoading() {
  return (
    <main className="flex-1">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
        <div className="space-y-1.5">
          <Pulse className="h-5 w-36" />
          <Pulse className="h-3 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Pulse className="h-8 w-56 hidden sm:block" />
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 4 stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Pulse className="h-3.5 w-24" />
                  <Pulse className="h-8 w-16" />
                  <Pulse className="h-3 w-20" />
                </div>
                <Pulse className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* 4 more stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Pulse className="h-3.5 w-24" />
                  <Pulse className="h-8 w-16" />
                  <Pulse className="h-3 w-20" />
                </div>
                <Pulse className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* 2 content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <Pulse className="h-5 w-32" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Pulse className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Pulse className="h-3.5 w-32" />
                    <Pulse className="h-3 w-24" />
                  </div>
                  <Pulse className="h-5 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
          <Pulse className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Pulse className="h-7 w-7 rounded-full shrink-0" />
                <Pulse className="h-3.5 flex-1 max-w-[180px]" />
                <Pulse className="h-3.5 w-12" />
                <Pulse className="h-3.5 w-16" />
                <Pulse className="h-5 w-14 rounded-full" />
                <Pulse className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
