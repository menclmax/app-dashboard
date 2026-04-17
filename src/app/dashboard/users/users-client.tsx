"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Profile } from "@/lib/data"
import { verifyUser, unverifyUser, sendPasswordReset, restrictUser, blockUser, removeUser } from "@/app/actions/admin"
import {
  Search, Users, ShieldCheck, CheckCircle2, Calendar, Clock, Star, X, Wifi,
  ChevronDown, Mail, Ban, Lock, Trash2, ChevronLeft, ChevronRight, Eye,
} from "lucide-react"

function initials(name: string | null, username: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function isOnline(lastSeen: string | null) {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < 15 * 60 * 1000
}

type BulkAction = "verify" | "unverify" | "reset" | "restrict" | "block" | "remove" | null

const BULK_ACTIONS: { id: NonNullable<BulkAction>; label: string; icon: React.ElementType; destructive?: boolean }[] = [
  { id: "verify", label: "Verify", icon: ShieldCheck },
  { id: "unverify", label: "Unverify", icon: ShieldCheck },
  { id: "reset", label: "Send Password Reset Email", icon: Mail },
  { id: "restrict", label: "Restrict", icon: Lock },
  { id: "block", label: "Block", icon: Ban },
  { id: "remove", label: "Remove Account", icon: Trash2, destructive: true },
]

export function UsersClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<BulkAction>(null)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [page, setPage] = useState(1)
  const [profileUser, setProfileUser] = useState<Profile | null>(null)
  const PAGE_SIZE = 20
  const [singleAction, setSingleAction] = useState<NonNullable<BulkAction>>("verify")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const onlineCount = users.filter((u) => isOnline(u.last_seen)).length

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = (u.name ?? "").toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    const matchOnline = !onlineOnly || isOnline(u.last_seen)
    return matchSearch && matchOnline
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allSelected = paged.length > 0 && paged.every((u) => selected.has(u.id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((u) => u.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
    setBulkAction(null)
  }

  function openSingleAction(user: Profile, action: NonNullable<BulkAction>) {
    setSelectedUser(user)
    setSingleAction(action)
    setDone(false)
  }

  function closeDialog() {
    setSelectedUser(null)
    setBulkAction(null)
    setDone(false)
  }

  async function handleAction() {
    setPending(true)
    const action = bulkAction ?? singleAction
    const ids = bulkAction ? Array.from(selected) : selectedUser ? [selectedUser.id] : []

    if (action === "verify") {
      await Promise.all(ids.map((id) => verifyUser(id)))
      setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, verified: true } : u))
    } else if (action === "unverify") {
      await Promise.all(ids.map((id) => unverifyUser(id)))
      setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, verified: false } : u))
    } else if (action === "reset") {
      await Promise.all(ids.map((id) => sendPasswordReset(id)))
    } else if (action === "restrict") {
      await Promise.all(ids.map((id) => restrictUser(id)))
    } else if (action === "block") {
      await Promise.all(ids.map((id) => blockUser(id)))
    } else if (action === "remove") {
      await Promise.all(ids.map((id) => removeUser(id)))
      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)))
    }

    setPending(false)
    setDone(true)
    clearSelection()
  }

  const selectedUsers = users.filter((u) => selected.has(u.id))
  const unverifiedSelected = selectedUsers.filter((u) => !u.verified)

  return (
    <main className="flex-1">
      <Header title="User Management" />
      <div className="p-6 space-y-4">

        {/* Search + bulk action bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by name or username..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <button
                onClick={() => { setOnlineOnly((v) => !v); setPage(1) }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  onlineOnly ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${onlineOnly ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                Online Now · {onlineCount}
              </button>
              </div>

              {someSelected && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{selected.size} selected</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8">
                        Actions
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {BULK_ACTIONS.map(({ id, label, icon: Icon, destructive }) => (
                        <DropdownMenuItem
                          key={id}
                          className={`gap-2 ${destructive ? "text-red-600 focus:text-red-600" : ""}`}
                          onClick={() => { setBulkAction(id); setDone(false) }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="py-3 pl-4 pr-2 w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">XP</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Seen</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map((user) => {
                    const isSelected = selected.has(user.id)
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors group ${isSelected ? "bg-slate-100/60" : "hover:bg-slate-50/50"}`}
                      >
                        <td className="py-3.5 pl-4 pr-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(user.id)}
                            aria-label={`Select ${user.name ?? user.username}`}
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url ?? undefined} />
                                <AvatarFallback className="text-xs">{initials(user.name, user.username)}</AvatarFallback>
                              </Avatar>
                              {isOnline(user.last_seen) && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{user.name ?? user.username}</p>
                              <p className="text-xs text-slate-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{user.level}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{user.xp}</td>
                        <td className="py-3.5 px-4">
                          {user.verified
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {user.last_seen ? new Date(user.last_seen).toLocaleString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setProfileUser(user)} title="View Profile"
                              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {user.verified ? (
                              <button onClick={() => openSingleAction(user, "unverify")} title="Unverify"
                                className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button onClick={() => openSingleAction(user, "verify")} title="Verify"
                                className="p-1.5 rounded-md text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button onClick={() => openSingleAction(user, "reset")} title="Send Password Reset"
                              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openSingleAction(user, "restrict")} title="Restrict"
                              className="p-1.5 rounded-md text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openSingleAction(user, "block")} title="Block"
                              className="p-1.5 rounded-md text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openSingleAction(user, "remove")} title="Remove Account"
                              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-slate-200 text-slate-800 border border-slate-200"
                          : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk / single action dialog */}
      {(() => {
        const actionDef = BULK_ACTIONS.find((a) => a.id === (bulkAction ?? singleAction))
        const isBulk = !!bulkAction
        const affectedUsers = isBulk ? selectedUsers : selectedUser ? [selectedUser] : []
        const isDestructive = actionDef?.destructive

        return (
          <Dialog open={!!selectedUser || !!bulkAction} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionDef?.label}{isBulk && affectedUsers.length > 1 ? ` (${affectedUsers.length})` : ""}
                </DialogTitle>
                <DialogDescription>
                  {isBulk
                    ? `This will apply to ${affectedUsers.length} selected user${affectedUsers.length !== 1 ? "s" : ""}.`
                    : `Apply to this user's account.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 my-2 max-h-48 overflow-y-auto">
                {affectedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={u.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">{initials(u.name, u.username)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.name ?? u.username}</p>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                    </div>
                    {!isBulk && (
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="h-3 w-3" />Lv {u.level} · {u.xp} XP</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3 w-3" />{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {done ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="font-medium text-slate-800">Done!</p>
                  <Button variant="outline" onClick={closeDialog} className="mt-2">Close</Button>
                </div>
              ) : (
                <div className="flex gap-2 justify-end mt-2">
                  <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button
                    onClick={handleAction}
                    disabled={pending}
                    variant={isDestructive ? "destructive" : "default"}
                  >
                    {pending ? "Working…" : actionDef?.label ?? "Confirm"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Profile modal */}
      <Dialog open={!!profileUser} onOpenChange={() => setProfileUser(null)}>
        <DialogContent className="sm:max-w-sm">
          {profileUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileUser.avatar_url ?? undefined} />
                    <AvatarFallback className="text-2xl">{initials(profileUser.name, profileUser.username)}</AvatarFallback>
                  </Avatar>
                  {isOnline(profileUser.last_seen) && (
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 text-lg">{profileUser.name ?? profileUser.username}</p>
                  <p className="text-sm text-slate-400">@{profileUser.username}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {profileUser.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {profileUser.is_admin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                      Admin
                    </span>
                  )}
                  {isOnline(profileUser.last_seen) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Wifi className="h-3 w-3" /> Online
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 text-sm">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="flex items-center gap-2 text-slate-500"><Star className="h-3.5 w-3.5" />Level</span>
                  <span className="font-medium text-slate-800">{profileUser.level}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="flex items-center gap-2 text-slate-500"><Star className="h-3.5 w-3.5" />XP</span>
                  <span className="font-medium text-slate-800">{profileUser.xp}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="flex items-center gap-2 text-slate-500"><Clock className="h-3.5 w-3.5" />Last Seen</span>
                  <span className="font-medium text-slate-800">{profileUser.last_seen ? new Date(profileUser.last_seen).toLocaleString() : "—"}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="flex items-center gap-2 text-slate-500"><Calendar className="h-3.5 w-3.5" />Joined</span>
                  <span className="font-medium text-slate-800">{profileUser.created_at ? new Date(profileUser.created_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setProfileUser(null); openSingleAction(profileUser, profileUser.verified ? "unverify" : "verify") }}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                  {profileUser.verified ? "Unverify" : "Verify"}
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-100" onClick={() => { setProfileUser(null); openSingleAction(profileUser, "remove") }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
