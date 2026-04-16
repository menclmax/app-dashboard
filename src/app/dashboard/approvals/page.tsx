"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MOCK_PLACES, type Place } from "@/lib/mock-data"
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Images,
  User,
  Calendar,
  Coffee,
  ChevronRight,
} from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Café",
  specialty: "Specialty Coffee",
  roastery: "Roastery",
  "bakery-cafe": "Bakery Café",
  coworking: "Coworking Café",
}

export default function ApprovalsPage() {
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionNote, setRejectionNote] = useState("")
  const [done, setDone] = useState(false)

  const pending = places.filter((p) => p.status === "pending")
  const approved = places.filter((p) => p.status === "approved")
  const rejected = places.filter((p) => p.status === "rejected")

  function openApprove(place: Place) {
    setSelectedPlace(place)
    setAction("approve")
    setRejectionNote("")
    setDone(false)
  }

  function openReject(place: Place) {
    setSelectedPlace(place)
    setAction("reject")
    setRejectionNote("")
    setDone(false)
  }

  function closeDialog() {
    setSelectedPlace(null)
    setAction(null)
    setRejectionNote("")
    setDone(false)
  }

  function applyAction() {
    if (!selectedPlace || !action) return
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPlace.id) return p
        if (action === "approve") return { ...p, status: "approved" as const }
        return { ...p, status: "rejected" as const, rejectionNote: rejectionNote || undefined }
      })
    )
    setDone(true)
  }

  const pendingCount = pending.length

  return (
    <main className="flex-1">
      <Header title="Place Approvals" description="Review new coffee spots submitted by the community" />
      <div className="p-6 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/20">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{approved.length}</p>
                <p className="text-xs text-emerald-600 font-medium">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/20">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
                <p className="text-xs text-red-500 font-medium">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Awaiting Review
            </h2>
            <div className="space-y-3">
              {pending.map((place) => (
                <PlaceCard key={place.id} place={place} onApprove={() => openApprove(place)} onReject={() => openReject(place)} />
              ))}
            </div>
          </section>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Approved
            </h2>
            <div className="space-y-3">
              {approved.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 text-red-400" /> Rejected
            </h2>
            <div className="space-y-3">
              {rejected.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Approve/Reject dialog */}
      <Dialog open={!!selectedPlace && !!action} onOpenChange={closeDialog}>
        {selectedPlace && action && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{action === "approve" ? "Approve Place" : "Reject Place"}</DialogTitle>
              <DialogDescription>
                {action === "approve"
                  ? "This place will go live on the app and be visible to all users."
                  : "This place will be rejected. You can optionally add a note for the submitter."}
              </DialogDescription>
            </DialogHeader>

            {/* Place info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 my-2 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                  <Coffee className="h-4 w-4 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{selectedPlace.name}</p>
                  <p className="text-xs text-slate-500">{selectedPlace.address}, {selectedPlace.city}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedPlace.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{selectedPlace.submittedBy}</span>
                <span className="flex items-center gap-1"><Images className="h-3 w-3" />{selectedPlace.images} photos</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(selectedPlace.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {action === "reject" && !done && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Rejection note <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                  rows={3}
                  placeholder="Let the user know why their spot was rejected and what they can do to resubmit..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                />
              </div>
            )}

            {done ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                {action === "approve"
                  ? <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  : <XCircle className="h-8 w-8 text-red-400" />}
                <p className="font-medium text-slate-800">
                  {action === "approve" ? "Place approved!" : "Place rejected."}
                </p>
                <Button variant="outline" onClick={closeDialog} className="mt-2">Close</Button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                {action === "approve"
                  ? <Button variant="success" onClick={applyAction}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                  : <Button variant="destructive" onClick={applyAction}><XCircle className="h-4 w-4" /> Reject</Button>}
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}

function PlaceCard({
  place,
  onApprove,
  onReject,
}: {
  place: Place
  onApprove?: () => void
  onReject?: () => void
}) {
  const isPending = place.status === "pending"
  const isApproved = place.status === "approved"
  const isRejected = place.status === "rejected"

  return (
    <Card className={isApproved ? "border-emerald-100" : isRejected ? "border-red-100" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
            isApproved ? "bg-emerald-100" : isRejected ? "bg-red-50" : "bg-yellow-100"
          }`}>
            <Coffee className={`h-5 w-5 ${isApproved ? "text-emerald-600" : isRejected ? "text-red-400" : "text-yellow-700"}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800">{place.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[place.category]}</Badge>
                  <Badge
                    variant={isApproved ? "success" : isRejected ? "destructive" : "warning"}
                    className="text-[10px] capitalize"
                  >
                    {place.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{place.address}, {place.city}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{place.submittedBy}</span>
                  <span className="flex items-center gap-1"><Images className="h-3 w-3" />{place.images} photos</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(place.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{place.description}</p>

            {isRejected && place.rejectionNote && (
              <div className="mt-2 p-2.5 rounded-md bg-red-50 border border-red-100">
                <p className="text-xs font-medium text-red-600 mb-0.5">Rejection note</p>
                <p className="text-xs text-red-500">{place.rejectionNote}</p>
              </div>
            )}

            {isPending && onApprove && onReject && (
              <div className="flex gap-2 mt-3">
                <Button variant="success" size="sm" onClick={onApprove}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button variant="outline" size="sm" onClick={onReject} className="text-red-500 border-red-200 hover:bg-red-50">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
