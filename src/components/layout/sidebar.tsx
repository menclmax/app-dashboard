"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard, Users, Wifi, MapPin, CheckSquare, Settings,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-slate-800">
        <Image src="/calaboca-svg.svg" alt="Calaboca" width={120} height={28} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Main</p>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-yellow-400" : "text-slate-500")} />
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
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">System</p>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/dashboard/settings")
                ? "bg-yellow-400/10 text-yellow-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <Settings className={cn("h-4 w-4 shrink-0", pathname.startsWith("/dashboard/settings") ? "text-yellow-400" : "text-slate-500")} />
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  )
}
