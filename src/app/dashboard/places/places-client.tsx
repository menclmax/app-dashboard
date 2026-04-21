"use client"

import dynamic from "next/dynamic"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { type Venue } from "@/lib/data"
import { type PlaceFill } from "./place-lookup"
import { approveVenue, unapproveVenue } from "@/app/actions/admin"
import { VenueForm } from "./venue-form"
import {
  MapPin, Star, CheckCircle2, Clock,
  Search, LayoutList, LayoutGrid, Wifi, Zap, PawPrint,
  Leaf, X, Plus, Edit2, ChevronRight, Loader2,
  PanelRightClose, PanelRightOpen,
} from "lucide-react"
import { uploadVenuePhoto } from "@/app/actions/venues"

const VenuesMap = dynamic(
  () => import("./venues-map").then((m) => m.VenuesMap),
  { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-slate-100 rounded-xl" /> }
)

const DynamicPlaceLookup = dynamic(
  () => import("./place-lookup").then((m) => m.PlaceLookup),
  { ssr: false }
)

type PanelMode =
  | { type: "new" }
  | { type: "edit"; venue: Venue }

function priceLabel(p: number | null) {
  if (!p) return null
  return "€".repeat(p)
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-300">—</span>
  const r = Math.round(Number(rating))
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < r ? "fill-yellow-400 text-yellow-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs text-slate-500 ml-1">{Number(rating).toFixed(1)}</span>
    </span>
  )
}

function AmenityIcons({ venue }: { venue: Venue }) {
  return (
    <div className="flex items-center gap-1.5">
      {venue.wifi && <span title="WiFi"><Wifi className="h-3 w-3 text-sky-500" /></span>}
      {venue.outlets && <span title="Outlets"><Zap className="h-3 w-3 text-yellow-500" /></span>}
      {venue.pet_friendly && <span title="Pet Friendly"><PawPrint className="h-3 w-3 text-amber-600" /></span>}
      {venue.vegan && <span title="Vegan Options"><Leaf className="h-3 w-3 text-emerald-500" /></span>}
    </div>
  )
}

function VenueThumb({ venue }: { venue: Venue }) {
  const src = venue.cover_photo_url ?? venue.photo_url
  if (src) {
    return (
      <div className="w-full h-36 rounded-t-xl overflow-hidden bg-slate-100 shrink-0">
        <img src={src} alt={venue.name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className="w-full h-36 rounded-t-xl shrink-0 flex items-center justify-center"
      style={{ background: venue.cover_color ?? "#C8A97E" }}
    >
      <MapPin className="h-8 w-8 text-white/60" />
    </div>
  )
}

export function PlacesClient({ venues }: { venues: Venue[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"table" | "grid">("table")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filterApproved, setFilterApproved] = useState<"all" | "approved" | "pending" | "seeded">("all")
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelMode, setPanelMode] = useState<PanelMode>({ type: "new" })
  const [prefill, setPrefill] = useState<Partial<Venue> | null>(null)
  const [formKey, setFormKey] = useState(0)
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map())
  const logoInputRef = useRef<HTMLInputElement>(null)
  const pendingLogoVenueId = useRef<string | null>(null)
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null)
  const [logoOverrides, setLogoOverrides] = useState<Record<string, string>>({})

  const total = venues.length
  const approved = venues.filter((v) => v.is_approved).length
  const pending = venues.filter((v) => v.is_user_submitted && !v.is_approved).length
  const seeded = venues.filter((v) => !v.is_user_submitted).length

  const filtered = venues.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      (v.address ?? "").toLowerCase().includes(q) ||
      (v.tags ?? []).some((t) => t.toLowerCase().includes(q))
    const matchFilter =
      filterApproved === "all" ||
      (filterApproved === "approved" && v.is_approved) ||
      (filterApproved === "pending" && v.is_user_submitted && !v.is_approved) ||
      (filterApproved === "seeded" && !v.is_user_submitted)
    return matchSearch && matchFilter
  })

  function handleMarkerSelect(id: string) {
    setActiveId(id)
    const el = rowRefs.current.get(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  function openEdit(venue: Venue) {
    setPanelMode({ type: "edit", venue })
    setPrefill(null)
    setFormKey((k) => k + 1)
    setPanelOpen(true)
  }

  function openNew() {
    setPanelMode({ type: "new" })
    setPrefill(null)
    setFormKey((k) => k + 1)
    setPanelOpen(true)
  }

  function handleLookupResult(data: PlaceFill) {
    setPrefill(data)
    setFormKey((k) => k + 1)
  }

  function handleFormSuccess() {
    router.refresh()
    setPanelMode({ type: "new" })
    setPrefill(null)
    setFormKey((k) => k + 1)
  }

  const FILTERS: { id: typeof filterApproved; label: string; count: number }[] = [
    { id: "all", label: "All", count: total },
    { id: "approved", label: "Approved", count: approved },
    { id: "pending", label: "Pending", count: pending },
    { id: "seeded", label: "Seeded", count: seeded },
  ]

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const venueId = pendingLogoVenueId.current
    e.target.value = ""
    if (!file || !venueId) return
    setUploadingLogoId(venueId)
    const fd = new FormData()
    fd.append("file", file)
    const result = await uploadVenuePhoto(venueId, fd, "logo_url")
    setUploadingLogoId(null)
    if ("url" in result) setLogoOverrides((prev) => ({ ...prev, [venueId]: result.url }))
  }

  function triggerLogoUpload(venueId: string) {
    pendingLogoVenueId.current = venueId
    logoInputRef.current?.click()
  }

  const isEditMode = panelMode.type === "edit"
  const panelVenueId = isEditMode ? panelMode.venue.id : null
  const formVenue = isEditMode
    ? { ...panelMode.venue, ...prefill }
    : prefill ?? undefined

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />

      {/* ── Left: map + list ── */}
      <div className={`flex flex-col min-h-0 overflow-hidden transition-[width] duration-300 ease-in-out ${panelOpen ? "w-3/5" : "w-full"}`}>
        <Header title="Places" description={`${total} venues`} />

        {/* Fixed top: map + admin bar + toolbar */}
        <div className="shrink-0 flex flex-col gap-4 px-6 pt-5 pb-3">

          <Card className="overflow-hidden p-0">
            <div className="h-[280px]">
              <VenuesMap venues={venues} activeId={activeId} onSelect={handleMarkerSelect} />
            </div>
            <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />Approved</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-slate-400" />Seeded</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-indigo-500" />Selected</span>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Admin</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPanelOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title={panelOpen ? "Collapse panel" : "Open panel"}
              >
                {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Spot
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-36">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search venues, tags…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterApproved(f.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterApproved === f.id
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f.label}
                  <span className={`ml-1 ${filterApproved === f.id ? "text-slate-500" : "text-slate-400"}`}>{f.count}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setView("table")}
                className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {search && (
            <p className="text-xs text-slate-400 -mt-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </p>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">

          {/* Table view */}
          {view === "table" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue</th>
                        {false && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>}
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                        {false && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>}
                        {false && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amenities</th>}
                        {false && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>}
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((venue) => {
                        const isActive = venue.id === activeId
                        const isPanelVenue = venue.id === panelVenueId
                        return (
                          <tr
                            key={venue.id}
                            ref={(el) => { if (el) rowRefs.current.set(venue.id, el) }}
                            onClick={() => { setActiveId(venue.id); openEdit(venue) }}
                            className={`transition-colors cursor-pointer ${
                              isPanelVenue
                                ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200"
                                : isActive
                                ? "bg-slate-50"
                                : "hover:bg-slate-50/50"
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                {(() => {
                                  const logoUrl = logoOverrides[venue.id] ?? venue.logo_url
                                  const isUploading = uploadingLogoId === venue.id
                                  if (logoUrl) {
                                    return (
                                      <div
                                        className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 overflow-hidden"
                                        style={{ background: "white" }}
                                      >
                                        <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" />
                                      </div>
                                    )
                                  }
                                  return (
                                    <button
                                      type="button"
                                      title="Add logo"
                                      disabled={isUploading}
                                      onClick={(e) => { e.stopPropagation(); triggerLogoUpload(venue.id) }}
                                      className="group relative flex h-9 w-9 items-center justify-center rounded-lg shrink-0 overflow-hidden border border-dashed border-slate-300 hover:border-indigo-400 transition-colors"
                                      style={{ background: venue.cover_color ?? "#C8A97E" }}
                                    >
                                      {isUploading ? (
                                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                                      ) : (venue.cover_photo_url ?? venue.photo_url) ? (
                                        <img src={venue.cover_photo_url ?? venue.photo_url!} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <MapPin className="h-4 w-4 text-white/70" />
                                      )}
                                      {!isUploading && (
                                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-semibold leading-tight text-center px-0.5">
                                          Add logo
                                        </span>
                                      )}
                                    </button>
                                  )
                                })()}
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800 truncate">{venue.name}</p>
                                  {venue.tags && venue.tags.length > 0 && (
                                    <p className="text-xs text-slate-400 truncate max-w-[160px]">{venue.tags.slice(0, 2).join(", ")}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            {false && (
                              <td className="py-3.5 px-4">
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-36">{venue.address ?? "—"}</span>
                                </span>
                              </td>
                            )}
                            <td className="py-3.5 px-4">
                              <StarRating rating={venue.rating} />
                            </td>
                            {false && (
                              <td className="py-3.5 px-4">
                                <span className="text-xs text-slate-600 font-medium">{priceLabel(venue.price_range) ?? "—"}</span>
                              </td>
                            )}
                            {false && (
                              <td className="py-3.5 px-4">
                                <AmenityIcons venue={venue} />
                              </td>
                            )}
                            {false && (
                              <td className="py-3.5 px-4">
                                <span className="text-xs text-slate-500">
                                  {venue.created_at ? new Date(venue.created_at as string).toLocaleDateString() : "—"}
                                </span>
                              </td>
                            )}
                            <td className="py-3.5 px-4">
                              <StatusBadge venue={venue} />
                            </td>
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEdit(venue)}
                                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                    isPanelVenue
                                      ? "bg-indigo-100 text-indigo-600"
                                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  }`}
                                  title="Edit venue"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <ApproveButton venue={venue} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="py-16 text-center text-slate-400">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No venues found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid view */}
          {view === "grid" && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {filtered.map((venue) => {
                const isActive = venue.id === activeId
                const isPanelVenue = venue.id === panelVenueId
                return (
                  <div
                    key={venue.id}
                    ref={(el) => { if (el) rowRefs.current.set(venue.id, el) }}
                    onClick={() => { setActiveId(venue.id); openEdit(venue) }}
                    className={`rounded-xl border bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      isPanelVenue
                        ? "ring-2 ring-indigo-400 shadow-indigo-100 shadow-md"
                        : isActive
                        ? "ring-1 ring-slate-300"
                        : "border-slate-200"
                    }`}
                  >
                    <VenueThumb venue={venue} />
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{venue.name}</p>
                          {venue.address && (
                            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {venue.address}
                            </p>
                          )}
                        </div>
                        <StatusBadge venue={venue} />
                      </div>
                      <div className="flex items-center justify-between">
                        <StarRating rating={venue.rating} />
                        {venue.price_range && <span className="text-xs font-medium text-slate-500">{priceLabel(venue.price_range)}</span>}
                      </div>
                      {venue.tags && venue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {venue.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <AmenityIcons venue={venue} />
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(venue)}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                              isPanelVenue ? "bg-indigo-100 text-indigo-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <ApproveButton venue={venue} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No venues found</p>
                </div>
              )}
            </div>
          )}

        </div>{/* end scrollable list */}
      </div>{/* end left column */}

      {/* ── Right: edit / new panel ── */}
      <aside className={`flex flex-col min-h-0 overflow-hidden border-l border-slate-200 bg-white shrink-0 transition-[width] duration-300 ease-in-out ${panelOpen ? "w-2/5" : "w-0"}`}>

        {/* Panel header — fixed */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <button onClick={openNew} className="text-slate-400 shrink-0 hover:text-slate-600">Places</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              {panelMode.type === "new" ? "New Venue" : panelMode.venue.name}
            </span>
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            {isEditMode && (
              <button
                onClick={openNew}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="New venue"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setPanelOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Collapse panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          <DynamicPlaceLookup onResult={handleLookupResult} />
          <VenueForm
            key={formKey}
            mode={panelMode.type}
            venue={formVenue}
            onSuccess={handleFormSuccess}
            onCancel={openNew}
          />
        </div>

      </aside>

    </div>
  )
}

function StatusBadge({ venue }: { venue: Venue }) {
  if (venue.is_approved) return <Badge variant="success" className="text-[10px]">Approved</Badge>
  if (venue.is_user_submitted) return <Badge variant="warning" className="text-[10px]">Pending</Badge>
  return <Badge variant="outline" className="text-[10px]">Seeded</Badge>
}

function ApproveButton({ venue }: { venue: Venue }) {
  if (venue.is_user_submitted && !venue.is_approved) {
    return (
      <form action={approveVenue.bind(null, venue.id)}>
        <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
          <CheckCircle2 className="h-4 w-4" />
        </button>
      </form>
    )
  }
  if (venue.is_approved) {
    return (
      <form action={unapproveVenue.bind(null, venue.id)}>
        <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Revoke approval">
          <Clock className="h-4 w-4" />
        </button>
      </form>
    )
  }
  return null
}
