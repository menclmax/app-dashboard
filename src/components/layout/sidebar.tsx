"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Wifi,
  MapPin,
  CheckSquare,
  Coffee,
  LogOut,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/online", label: "Online Users", icon: Wifi },
  { href: "/dashboard/places", label: "All Places", icon: MapPin },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare, badge: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400">
          <Coffee className="h-4 w-4 text-yellow-900" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">calaboca</span>
          <span className="block text-yellow-400 text-[10px] font-medium uppercase tracking-widest -mt-0.5">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Main</p>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                active
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-yellow-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-[10px] font-bold text-yellow-900">
                  4
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">System</p>
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors group">
            <Settings className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
            Settings
          </Link>
        </div>
      </nav>

      {/* Admin user */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-3 border border-white/10 bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@calaboca.app</p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
