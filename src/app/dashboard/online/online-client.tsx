"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type Profile } from "@/lib/data"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Wifi, Clock } from "lucide-react"

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000
const RECENT_THRESHOLD_MS = 24 * 60 * 60 * 1000

function isOnline(lastSeen: string | null) {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS
}

function isRecent(lastSeen: string | null) {
  if (!lastSeen) return false
  const age = Date.now() - new Date(lastSeen).getTime()
  return age >= ONLINE_THRESHOLD_MS && age < RECENT_THRESHOLD_MS
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—"
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function initials(name: string | null, username: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export function OnlineClient({
  initialOnline,
  initialOffline,
}: {
  initialOnline: Profile[]
  initialOffline: Profile[]
}) {
  const [profiles, setProfiles] = useState<Map<string, Profile>>(() => {
    const map = new Map<string, Profile>()
    for (const p of initialOnline) map.set(p.id, p)
    for (const p of initialOffline) map.set(p.id, p)
    return map
  })

  useEffect(() => {
    const sb = getSupabaseBrowser()
    const channel = sb
      .channel("online-users")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new as Profile
          setProfiles((prev) => {
            const next = new Map(prev)
            if (isOnline(updated.last_seen) || isRecent(updated.last_seen)) {
              next.set(updated.id, updated)
            } else {
              next.delete(updated.id)
            }
            return next
          })
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [])

  const allProfiles = Array.from(profiles.values())
  const onlineUsers = allProfiles.filter((p) => isOnline(p.last_seen))
  const recentlyOffline = allProfiles
    .filter((p) => isRecent(p.last_seen))
    .sort((a, b) => new Date(b.last_seen!).getTime() - new Date(a.last_seen!).getTime())

  return (
    <main className="flex-1 overflow-y-auto">
      <Header title="Online Users" description="Real-time active sessions" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20">
                <Wifi className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{onlineUsers.length}</p>
                <p className="text-xs text-emerald-600 font-medium">Online now</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{recentlyOffline.length}</p>
                <p className="text-xs text-slate-500">Recently offline</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">Currently Online</CardTitle>
                <Badge variant="online" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {onlineUsers.length === 0 && (
                <p className="text-sm text-slate-400 py-6 text-center">No users online</p>
              )}
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback>{initials(user.name, user.username)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name ?? user.username}</p>
                      {user.verified && <VerifiedBadge />}
                      {user.is_admin && <AdminBadge />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500 font-medium">Lv {user.level}</p>
                    <p className="text-[10px] text-slate-400">{user.xp} XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Recently Offline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentlyOffline.length === 0 && (
                <p className="text-sm text-slate-400 py-6 text-center">No recent activity</p>
              )}
              {recentlyOffline.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10 opacity-70">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback>{initials(user.name, user.username)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-300 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-600 truncate">{user.name ?? user.username}</p>
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400">{timeAgo(user.last_seen)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-yellow-400" title="Verified">
      <svg viewBox="0 0 10 10" className="h-2 w-2 fill-yellow-900">
        <path d="M5 1L1 2.5v3C1 7.5 2.8 9.2 5 9.8c2.2-.6 4-2.3 4-4.3v-3L5 1z" />
      </svg>
    </span>
  )
}

function AdminBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-white">
      admin
    </span>
  )
}
