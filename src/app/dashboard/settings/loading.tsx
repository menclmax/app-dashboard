function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

export default function SettingsLoading() {
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

      <div className="p-6 space-y-6 max-w-2xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
            <div className="space-y-1.5">
              <Pulse className="h-5 w-36" />
              <Pulse className="h-3 w-64" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <Pulse className="h-3.5 w-20" />
                  <Pulse className="h-9 w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Pulse className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
