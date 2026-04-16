"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MOCK_USERS, type User, type UserStatus, type UserPlan } from "@/lib/mock-data"
import {
  Search,
  Users,
  ShieldCheck,
  Ban,
  Lock,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Star,
  Mail,
  Calendar,
  Clock,
  X,
} from "lucide-react"

type ActionType = "suspend" | "ban" | "unban" | "verify" | "reset-password" | "change-plan" | null

function statusVariant(status: UserStatus) {
  if (status === "active") return "success"
  if (status === "suspended") return "warning"
  return "destructive"
}

function planVariant(plan: UserPlan) {
  if (plan === "premium") return "default"
  if (plan === "pro") return "secondary"
  return "outline"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [newPlan, setNewPlan] = useState<UserPlan>("free")
  const [actionDone, setActionDone] = useState(false)

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    const matchPlan = planFilter === "all" || u.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  function openAction(user: User, action: ActionType) {
    setSelectedUser(user)
    setActionType(action)
    setNewPlan(user.plan)
    setActionDone(false)
  }

  function closeDialog() {
    setSelectedUser(null)
    setActionType(null)
    setActionDone(false)
  }

  function applyAction() {
    if (!selectedUser || !actionType) return
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== selectedUser.id) return u
        if (actionType === "suspend") return { ...u, status: "suspended" as UserStatus }
        if (actionType === "ban") return { ...u, status: "banned" as UserStatus }
        if (actionType === "unban") return { ...u, status: "active" as UserStatus }
        if (actionType === "verify") return { ...u, verified: true }
        if (actionType === "change-plan") return { ...u, plan: newPlan }
        return u
      })
    )
    setActionDone(true)
  }

  const actionLabels: Record<Exclude<ActionType, null>, { title: string; desc: string; confirmLabel: string; variant: "default" | "destructive" | "success" }> = {
    suspend: { title: "Suspend User", desc: "This user will be temporarily disabled and cannot log in.", confirmLabel: "Suspend", variant: "destructive" },
    ban: { title: "Ban User", desc: "This user will be permanently banned from Calaboca.", confirmLabel: "Ban Permanently", variant: "destructive" },
    unban: { title: "Restore Access", desc: "This will re-activate the user's account.", confirmLabel: "Restore", variant: "success" },
    verify: { title: "Verify Account", desc: "Manually verify this user's account.", confirmLabel: "Verify Account", variant: "success" },
    "reset-password": { title: "Reset Password", desc: "A password reset email will be sent to the user.", confirmLabel: "Send Reset Email", variant: "default" },
    "change-plan": { title: "Change Plan", desc: "Update the user's subscription plan.", confirmLabel: "Update Plan", variant: "default" },
  }

  return (
    <main className="flex-1">
      <Header title="User Management" description={`${filtered.length} of ${users.length} users`} />
      <div className="p-6 space-y-4">

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Spots</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reviews</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            {user.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusVariant(user.status)} className="text-[10px] capitalize">{user.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={planVariant(user.plan)} className="text-[10px] capitalize">{user.plan}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.verified
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <X className="h-4 w-4 text-slate-300" />}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{user.spotsAdded}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{user.reviews}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{user.joinedAt}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!user.verified && (
                            <button onClick={() => openAction(user, "verify")} className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Verify">
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => openAction(user, "reset-password")} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Reset Password">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => openAction(user, "change-plan")} className="p-1.5 rounded-md hover:bg-yellow-50 text-slate-400 hover:text-yellow-600 transition-colors" title="Change Plan">
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          {user.status === "active" && (
                            <button onClick={() => openAction(user, "suspend")} className="p-1.5 rounded-md hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors" title="Suspend">
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {user.status !== "banned" && (
                            <button onClick={() => openAction(user, "ban")} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Ban">
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {(user.status === "banned" || user.status === "suspended") && (
                            <button onClick={() => openAction(user, "unban")} className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Restore">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action dialog */}
      <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
        {selectedUser && actionType && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionLabels[actionType].title}</DialogTitle>
              <DialogDescription>{actionLabels[actionType].desc}</DialogDescription>
            </DialogHeader>

            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 my-2">
              <Avatar>
                <AvatarFallback>{selectedUser.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{selectedUser.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" />{selectedUser.email}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{selectedUser.spotsAdded} spots</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3 w-3" />Joined {selectedUser.joinedAt}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />Last seen {new Date(selectedUser.lastSeen).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {actionType === "change-plan" && !actionDone && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select new plan</label>
                <Select value={newPlan} onValueChange={(v) => setNewPlan(v as UserPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionDone ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="font-medium text-slate-800">Done!</p>
                <p className="text-sm text-slate-500">Action applied successfully.</p>
                <Button variant="outline" onClick={closeDialog} className="mt-2">Close</Button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button
                  variant={actionLabels[actionType].variant === "destructive" ? "destructive" : actionLabels[actionType].variant === "success" ? "success" : "default"}
                  onClick={applyAction}
                >
                  {actionLabels[actionType].confirmLabel}
                </Button>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
