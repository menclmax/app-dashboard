function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function OnlineLoading() {
  return (
    <main className="flex-1">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
        <div className="space-y-1.5">
          <Pulse className="h-5 w-32" />
          <Pulse className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <Pulse className="h-8 w-56 hidden sm:block" />
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 4 stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 flex items-center gap-3">
              <Pulse className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Pulse className="h-7 w-12" />
                <Pulse className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* 2 lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Pulse className="h-5 w-36" />
                <Pulse className="h-5 w-16 rounded-full" />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg">
                  <Pulse className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Pulse className="h-3.5 w-32" />
                    <Pulse className="h-3 w-24" />
                  </div>
                  <div className="space-y-1 text-right">
                    <Pulse className="h-4 w-14 rounded-full ml-auto" />
                    <Pulse className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
