import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MOCK_USERS } from "@/lib/mock-data"
import { Wifi, MapPin, Star, Clock } from "lucide-react"

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function OnlineUsersPage() {
  const onlineUsers = MOCK_USERS.filter((u) => u.isOnline)
  const offlineRecent = MOCK_USERS.filter((u) => !u.isOnline).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  )

  return (
    <main className="flex-1">
      <Header title="Online Users" description="Real-time active sessions on Calaboca" />
      <div className="p-6 space-y-6">

        {/* Live stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-slate-800">{offlineRecent.length}</p>
                <p className="text-xs text-slate-500">Recently offline</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50">
                <MapPin className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {onlineUsers.reduce((acc, u) => acc + u.spotsAdded, 0)}
                </p>
                <p className="text-xs text-slate-500">Spots by online users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Star className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {onlineUsers.reduce((acc, u) => acc + u.reviews, 0)}
                </p>
                <p className="text-xs text-slate-500">Reviews by online users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Currently online */}
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
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      {user.verified && <ShieldBadge />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={user.plan === "premium" ? "default" : user.plan === "pro" ? "secondary" : "outline"} className="text-[10px] mb-1">
                      {user.plan}
                    </Badge>
                    <p className="text-[10px] text-slate-400">{user.spotsAdded} spots · {user.reviews} reviews</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recently offline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">Recently Offline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {offlineRecent.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10 opacity-70">
                      <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-300 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-600 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={user.status === "active" ? "outline" : user.status === "suspended" ? "warning" : "destructive"} className="text-[10px] mb-1 capitalize">
                      {user.status}
                    </Badge>
                    <p className="text-[10px] text-slate-400">{timeAgo(user.lastSeen)}</p>
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

function ShieldBadge() {
  return (
    <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-yellow-400" title="Verified">
      <svg viewBox="0 0 10 10" className="h-2 w-2 fill-yellow-900">
        <path d="M5 1L1 2.5v3C1 7.5 2.8 9.2 5 9.8c2.2-.6 4-2.3 4-4.3v-3L5 1z" />
      </svg>
    </span>
  )
}
