import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDashboardStats, getOnlineUsers, getPendingVenues, getRecentUsers } from "@/lib/data"
import { approveVenue, verifyUser } from "@/app/actions/admin"
import {
  Users, UserPlus, Wifi, Clock, MapPin, Star,
  TrendingUp, TrendingDown, CheckCircle2, Coffee,
} from "lucide-react"

function trend(current: number, previous: number) {
  if (previous === 0 && current === 0) return null
  if (previous === 0) return { pct: 100, up: true }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { pct: Math.abs(pct), up: pct >= 0 }
}

function Trend({ current, previous }: { current: number; previous: number }) {
  const t = trend(current, previous)
  if (!t) return null
  const Icon = t.up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${t.up ? "text-emerald-600" : "text-red-500"}`}>
      <Icon className="h-3.5 w-3.5" />
      {t.pct}%
    </span>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  accent?: boolean
  trend?: React.ReactNode
}) {
  return (
    <Card className={accent ? "border-yellow-200 bg-yellow-50" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className={`text-3xl font-bold ${accent ? "text-yellow-700" : "text-slate-900"}`}>{value}</p>
              {trend}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-yellow-400/20" : "bg-slate-100"}`}>
            <Icon className={`h-5 w-5 ${accent ? "text-yellow-600" : "text-slate-600"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function initials(name: string | null, username: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export default async function OverviewPage() {
  const [stats, onlineUsers, pendingVenues, recentUsers] = await Promise.all([
    getDashboardStats(),
    getOnlineUsers(),
    getPendingVenues(),
    getRecentUsers(5),
  ])

  const monthlyGrowth = stats.signupsLastMonth > 0
    ? Math.round(((stats.signupsThisMonth - stats.signupsLastMonth) / stats.signupsLastMonth) * 100)
    : stats.signupsThisMonth > 0 ? 100 : 0

  return (
    <main className="flex-1 overflow-y-auto">
      <Header title="Overview" description="Welcome back — here's what's happening at Calaboca" />
      <div className="p-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} subtitle="All time" icon={Users}
            trend={<Trend current={stats.signupsThisMonth} previous={stats.signupsLastMonth} />} />
          <StatCard title="New Today" value={stats.newToday} subtitle="Signups in last 24h" icon={UserPlus} accent
            trend={<Trend current={stats.newToday} previous={stats.newYesterday} />} />
          <StatCard title="Online Now" value={stats.onlineNow} subtitle="Active in last 15 min" icon={Wifi} />
          <StatCard title="Pending Approvals" value={stats.pendingApprovals} subtitle="Venues awaiting review" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Venues" value={stats.totalVenues} subtitle="Submitted spots" icon={MapPin}
            trend={<Trend current={stats.venuesThisMonth} previous={stats.venuesLastMonth} />} />
          <StatCard title="Approved Venues" value={stats.approvedVenues} subtitle="Live on the app" icon={CheckCircle2} />
          <StatCard title="Total Reviews" value={stats.totalReviews} subtitle="Community reviews" icon={Star}
            trend={<Trend current={stats.reviewsThisMonth} previous={stats.reviewsLastMonth} />} />
          <StatCard title="Monthly Growth" value={`${monthlyGrowth > 0 ? "+" : ""}${monthlyGrowth}%`} subtitle="New users vs last month" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Online users */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">Online Now</CardTitle>
                <Badge variant="online" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {stats.onlineNow} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {onlineUsers.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No users online right now</p>
              )}
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{initials(user.name, user.username)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.name ?? user.username}</p>
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Lv {user.level}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending approvals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">Pending Approvals</CardTitle>
                <Badge variant="warning">{stats.pendingApprovals} waiting</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingVenues.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No pending venues</p>
              )}
              {pendingVenues.map((venue) => (
                <div key={venue.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                    <Coffee className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{venue.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {venue.address ?? "No address"} · by {venue.submitted_by_name ?? venue.submitted_by_username ?? "unknown"}
                    </p>
                  </div>
                  <form action={approveVenue.bind(null, venue.id)}>
                    <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Recent signups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-800">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">XP</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[10px]">{initials(user.name, user.username)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-800">{user.name ?? user.username}</p>
                            <p className="text-xs text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{user.level}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{user.xp}</td>
                      <td className="py-3 px-3">
                        {user.verified
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
