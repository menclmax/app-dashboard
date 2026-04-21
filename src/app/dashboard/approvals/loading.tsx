function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function ApprovalsLoading() {
  return (
    <main className="flex-1">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
        <div className="space-y-1.5">
          <Pulse className="h-5 w-28" />
          <Pulse className="h-3 w-52" />
        </div>
        <div className="flex items-center gap-3">
          <Pulse className="h-8 w-56 hidden sm:block" />
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-5">
              <Pulse className="h-3.5 w-24 mb-2" />
              <Pulse className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Approval cards */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 flex items-start gap-4">
              <Pulse className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Pulse className="h-4 w-40" />
                  <Pulse className="h-5 w-16 rounded-full" />
                </div>
                <Pulse className="h-3 w-56" />
                <div className="flex gap-2">
                  <Pulse className="h-4 w-14 rounded-full" />
                  <Pulse className="h-4 w-14 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Pulse className="h-8 w-8 rounded-md" />
                <Pulse className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
