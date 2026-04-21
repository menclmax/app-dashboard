function Pulse({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} style={style} />
}

export default function UsersLoading() {
  return (
    <main className="flex-1">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
        <div className="space-y-1.5">
          <Pulse className="h-5 w-24" />
          <Pulse className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Pulse className="h-8 w-56 hidden sm:block" />
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Search/filter bar */}
        <div className="flex items-center gap-3">
          <Pulse className="h-9 w-64" />
          <Pulse className="h-9 w-32" />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 flex gap-4">
            {[100, 80, 60, 60, 60, 80].map((w, i) => (
              <Pulse key={i} className={`h-3 w-${w === 100 ? '[100px]' : `[${w}px]`}`} style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 last:border-0">
              <Pulse className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5" style={{ width: 160 }}>
                <Pulse className="h-3.5 w-28" />
                <Pulse className="h-3 w-20" />
              </div>
              <Pulse className="h-3.5" style={{ width: 80 }} />
              <Pulse className="h-3.5" style={{ width: 60 }} />
              <Pulse className="h-5 w-16 rounded-full" />
              <Pulse className="h-3.5" style={{ width: 80 }} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Pulse className="h-4 w-32" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Pulse key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
