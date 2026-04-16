import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { STATS, MOCK_USERS, MOCK_PLACES } from "@/lib/mock-data"
import {
  Users,
  UserPlus,
  Wifi,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Coffee,
} from "lucide-react"

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <Card className={accent ? "border-yellow-200 bg-yellow-50" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${accent ? "text-yellow-700" : "text-slate-900"}`}>{value}</p>
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

export default function OverviewPage() {
  const onlineUsers = MOCK_USERS.filter((u) => u.isOnline)
  const pendingPlaces = MOCK_PLACES.filter((p) => p.status === "pending")
  const recentUsers = MOCK_USERS.slice(0, 5)

  return (
    <main className="flex-1">
      <Header title="Overview" description="Welcome back — here's what's happening at Calaboca" />
      <div className="p-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={STATS.totalUsers} subtitle="All time" icon={Users} />
          <StatCard title="New Today" value={STATS.newSignupsToday} subtitle="Signups in last 24h" icon={UserPlus} accent />
          <StatCard title="Online Now" value={STATS.onlineNow} subtitle="Active sessions" icon={Wifi} />
          <StatCard title="Pending Approvals" value={STATS.pendingApprovals} subtitle="Places awaiting review" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Places" value={STATS.totalPlaces} subtitle="Submitted spots" icon={MapPin} />
          <StatCard title="Approved Places" value={STATS.approvedPlaces} subtitle="Live on the app" icon={CheckCircle2} />
          <StatCard title="Total Reviews" value={STATS.totalReviews} subtitle="Community reviews" icon={Star} />
          <StatCard title="Monthly Growth" value={`+${STATS.monthlyGrowth}%`} subtitle="New users vs last month" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Online users */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">Online Now</CardTitle>
                <Badge variant="online" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {STATS.onlineNow} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Badge variant={user.plan === "premium" ? "default" : user.plan === "pro" ? "secondary" : "outline"} className="text-[10px]">
                    {user.plan}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending approvals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">Pending Approvals</CardTitle>
                <Badge variant="warning">{pendingPlaces.length} waiting</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingPlaces.map((place) => (
                <div key={place.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                    <Coffee className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{place.name}</p>
                    <p className="text-xs text-slate-500 truncate">{place.city} · by {place.submittedBy}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
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
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Spots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={user.plan === "premium" ? "default" : user.plan === "pro" ? "secondary" : "outline"} className="text-[10px]">
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={user.status === "active" ? "success" : user.status === "suspended" ? "warning" : "destructive"} className="text-[10px]">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{user.joinedAt}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{user.spotsAdded}</td>
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
