import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input placeholder="Search..." className="pl-8 w-56 h-8 text-sm" />
        </div>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-bold text-yellow-900">
            4
          </span>
        </button>
      </div>
    </header>
  )
}
