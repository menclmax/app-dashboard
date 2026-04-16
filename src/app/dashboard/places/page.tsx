import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_PLACES } from "@/lib/mock-data"
import { MapPin, Images, User, Calendar, Coffee } from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Café",
  specialty: "Specialty Coffee",
  roastery: "Roastery",
  "bakery-cafe": "Bakery Café",
  coworking: "Coworking Café",
}

const CATEGORY_COLORS: Record<string, string> = {
  cafe: "bg-blue-50 text-blue-600",
  specialty: "bg-purple-50 text-purple-600",
  roastery: "bg-orange-50 text-orange-600",
  "bakery-cafe": "bg-pink-50 text-pink-600",
  coworking: "bg-teal-50 text-teal-600",
}

export default function PlacesPage() {
  const total = MOCK_PLACES.length
  const approved = MOCK_PLACES.filter((p) => p.status === "approved").length
  const pending = MOCK_PLACES.filter((p) => p.status === "pending").length
  const rejected = MOCK_PLACES.filter((p) => p.status === "rejected").length

  return (
    <main className="flex-1">
      <Header title="All Places" description={`${total} coffee spots submitted to Calaboca`} />
      <div className="p-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: total, color: "text-slate-800" },
            { label: "Approved", value: approved, color: "text-emerald-600" },
            { label: "Pending", value: pending, color: "text-yellow-600" },
            { label: "Rejected", value: rejected, color: "text-red-500" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Place</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted by</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Photos</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_PLACES.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                            <Coffee className="h-4 w-4 text-yellow-700" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{place.name}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-48">{place.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[place.category]}`}>
                          {CATEGORY_LABELS[place.category]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{place.city}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <User className="h-3 w-3 shrink-0" />
                          {place.submittedBy}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Images className="h-3 w-3" />
                          {place.images}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(place.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            place.status === "approved" ? "success"
                            : place.status === "rejected" ? "destructive"
                            : "warning"
                          }
                          className="text-[10px] capitalize"
                        >
                          {place.status}
                        </Badge>
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
