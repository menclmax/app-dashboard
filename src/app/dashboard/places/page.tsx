import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllVenues } from "@/lib/data"
import { approveVenue, unapproveVenue } from "@/app/actions/admin"
import { MapPin, User, Calendar, Coffee, Star, CheckCircle2, Clock } from "lucide-react"

export default async function PlacesPage() {
  const venues = await getAllVenues()

  const total = venues.length
  const approved = venues.filter((v) => v.is_approved).length
  const userSubmitted = venues.filter((v) => v.is_user_submitted).length
  const pending = venues.filter((v) => v.is_user_submitted && !v.is_approved).length

  return (
    <main className="flex-1">
      <Header title="Venues" description={`${total} spots in Calaboca`} />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: total, color: "text-slate-800" },
            { label: "Approved", value: approved, color: "text-emerald-600" },
            { label: "User Submitted", value: userSubmitted, color: "text-blue-600" },
            { label: "Pending Review", value: pending, color: "text-yellow-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted by</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                            <Coffee className="h-4 w-4 text-yellow-700" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{venue.name}</p>
                            {venue.tags && venue.tags.length > 0 && (
                              <p className="text-xs text-slate-400 truncate max-w-48">{venue.tags.slice(0, 3).join(", ")}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-36">{venue.address ?? "—"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Star className="h-3 w-3 text-yellow-400 shrink-0" />
                          {venue.rating ? Number(venue.rating).toFixed(1) : "—"}
                          <span className="text-slate-400">({venue.review_count ?? 0})</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {venue.submitted_by ? (
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <User className="h-3 w-3 shrink-0" />
                            {venue.submitted_by_name ?? venue.submitted_by_username ?? "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {venue.created_at ? new Date(venue.created_at).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {venue.is_approved ? (
                          <Badge variant="success" className="text-[10px]">Approved</Badge>
                        ) : venue.is_user_submitted ? (
                          <Badge variant="warning" className="text-[10px]">Pending</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Seeded</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {venue.is_user_submitted && !venue.is_approved && (
                          <form action={approveVenue.bind(null, venue.id)}>
                            <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                        {venue.is_approved && (
                          <form action={unapproveVenue.bind(null, venue.id)}>
                            <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Revoke approval">
                              <Clock className="h-4 w-4" />
                            </button>
                          </form>
                        )}
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
