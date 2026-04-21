"use client"

import dynamic from "next/dynamic"
import { useState, useTransition, useCallback, KeyboardEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { type Venue, type DayHours, type OpeningHours, type SectionApprovals, type SectionApproval } from "@/lib/data"
import { createVenue, updateVenue, uploadVenuePhoto, toggleSectionApproval } from "@/app/actions/venues"
import { useUser } from "@/components/layout/user-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Upload, Loader2, CheckCircle2 } from "lucide-react"

const LocationPicker = dynamic(
  () => import("./location-picker").then((m) => m.LocationPicker),
  { ssr: false }
)

interface VenueFormProps {
  venue?: Partial<Venue>
  mode: "new" | "edit"
  onSuccess?: () => void
  onCancel?: () => void
}

const DAYS: { key: string; label: string }[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
]

const DEFAULT_DAY: DayHours = { open: "09:00", close: "22:00", closed: false }

function initHours(venue?: Partial<Venue>): OpeningHours {
  const base: OpeningHours = {}
  for (const { key } of DAYS) base[key] = { ...DEFAULT_DAY }
  if (venue?.opening_hours) {
    for (const { key } of DAYS) {
      if (venue.opening_hours[key]) base[key] = { ...venue.opening_hours[key] }
    }
  }
  return base
}

export function VenueForm({ venue, mode, onSuccess, onCancel }: VenueFormProps) {
  const router = useRouter()
  const currentUser = useUser()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(venue?.name ?? "")
  const [address, setAddress] = useState(venue?.address ?? "")
  const [googlePlaceId, setGooglePlaceId] = useState(venue?.google_place_id ?? "")

  const [tags, setTags] = useState<string[]>(venue?.tags ?? [])
  const [tagInput, setTagInput] = useState("")

  const [lat, setLat] = useState<number | null>(venue?.lat ?? null)
  const [lng, setLng] = useState<number | null>(venue?.lng ?? null)

  const [priceRange, setPriceRange] = useState<number | null>(venue?.price_range ?? null)
  const [coverColor, setCoverColor] = useState<string>(venue?.cover_color ?? "#C8A97E")

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(venue?.cover_photo_url ?? null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(venue?.photo_url ?? null)
  const [logoUrl, setLogoUrl] = useState<string | null>(venue?.logo_url ?? null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [googlePhotos, setGooglePhotos] = useState<string[]>(venue?.google_photos ?? [])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    venue?.selected_photos ?? (venue?.google_photos ?? []).slice(0, 5)
  )

  const [openingHours, setOpeningHours] = useState<OpeningHours>(() => initHours(venue))

  // Section approvals — live state, updated immediately on toggle
  const [sectionApprovals, setSectionApprovals] = useState<SectionApprovals>(
    (venue?.section_approvals as SectionApprovals) ?? {}
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed])
    setTagInput("")
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput) }
  }

  function removeTag(tag: string) { setTags((prev) => prev.filter((t) => t !== tag)) }

  function setDay(key: string, patch: Partial<DayHours>) {
    setOpeningHours((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  async function handleUpload(file: File, field: "cover_photo_url" | "photo_url" | "logo_url") {
    if (!venue?.id) return
    if (field === "cover_photo_url") setUploadingCover(true)
    else if (field === "photo_url") setUploadingPhoto(true)
    else setUploadingLogo(true)

    const fd = new FormData()
    fd.append("file", file)
    const result = await uploadVenuePhoto(venue.id, fd, field)

    if (field === "cover_photo_url") setUploadingCover(false)
    else if (field === "photo_url") setUploadingPhoto(false)
    else setUploadingLogo(false)

    if ("error" in result) setError(result.error)
    else {
      if (field === "cover_photo_url") setCoverPhotoUrl(result.url)
      else if (field === "photo_url") setPhotoUrl(result.url)
      else setLogoUrl(result.url)
    }
  }

  const handleSectionToggle = useCallback(async (section: string) => {
    const current = sectionApprovals[section]
    const approve = !current

    const approverName = currentUser?.name ?? currentUser?.username ?? null
    const approverAvatar = currentUser?.avatar_url ?? null

    if (approve) {
      setSectionApprovals((prev) => ({
        ...prev,
        [section]: {
          approved_by: currentUser?.username ?? "",
          approved_at: new Date().toISOString(),
          approver_name: approverName,
          approver_avatar: approverAvatar,
        } satisfies SectionApproval,
      }))
    } else {
      setSectionApprovals((prev) => {
        const next = { ...prev }
        delete next[section]
        return next
      })
    }

    // For existing venues, persist immediately. New venues save on submit.
    if (venue?.id) {
      const result = await toggleSectionApproval(
        venue.id,
        section,
        approve,
        { name: approverName, avatar: approverAvatar }
      )
      if (result && "error" in result) {
        setSectionApprovals((prev) => {
          const next = { ...prev }
          if (current) next[section] = current
          else delete next[section]
          return next
        })
      }
    }
  }, [venue?.id, sectionApprovals, currentUser])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const formData = new FormData(e.currentTarget)
    formData.set("lat", lat != null ? String(lat) : "0")
    formData.set("lng", lng != null ? String(lng) : "0")
    formData.set("opening_hours", JSON.stringify(openingHours))
    formData.set("google_photos", JSON.stringify(googlePhotos))
    formData.set("selected_photos", JSON.stringify(selectedPhotos))
    formData.set("section_approvals", JSON.stringify(sectionApprovals))

    startTransition(async () => {
      if (mode === "new") {
        const result = await createVenue(formData)
        setSaving(false)
        if ("error" in result) setError(result.error)
        else if (onSuccess) onSuccess()
        else router.push("/dashboard/places/" + result.id)
      } else if (venue?.id) {
        const result = await updateVenue(venue.id, formData)
        setSaving(false)
        if (result && "error" in result) setError(result.error)
        else {
          setSaved(true)
          setTimeout(() => { setSaved(false); onSuccess?.() }, 1200)
        }
      }
    })
  }

  const venueId = venue?.id

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeader label="Basic Info" section="basic_info" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Venue name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="google_place_id">Google Place ID</Label>
            <Input id="google_place_id" name="google_place_id" value={googlePlaceId} onChange={(e) => setGooglePlaceId(e.target.value)} placeholder="ChIJ… (auto-filled from URL)" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeader label="Location" section="location" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" name="lat" type="number" step="any" value={lat ?? ""} onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : null)} placeholder="38.716" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" name="lng" type="number" step="any" value={lng ?? ""} onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : null)} placeholder="-9.142" />
            </div>
          </div>
          <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng) }} />
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeader label="Details" section="details" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
              placeholder="Type a tag and press Enter or comma"
            />
            <input type="hidden" name="tags" value={tags.join(",")} />
          </div>
          <div className="space-y-2">
            <Label>Price Range</Label>
            <input type="hidden" name="price_range" value={priceRange ?? ""} />
            <div className="flex items-center gap-2">
              {([1, 2, 3] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPriceRange(priceRange === p ? null : p)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${priceRange === p ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                  {"€".repeat(p)}
                </button>
              ))}
              {priceRange !== null && (
                <button type="button" onClick={() => setPriceRange(null)} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_color">Cover Color</Label>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md border border-slate-200 shadow-sm shrink-0" style={{ background: coverColor }} />
              <input id="cover_color" name="cover_color" type="color" value={coverColor} onChange={(e) => setCoverColor(e.target.value)} className="h-8 w-24 cursor-pointer rounded border border-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeader label="Amenities" section="amenities" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <div className="grid grid-cols-2 gap-3">
            {([
              { name: "wifi", label: "WiFi" },
              { name: "outlets", label: "Outlets" },
              { name: "pet_friendly", label: "Pet Friendly" },
              { name: "vegan", label: "Vegan Options" },
              { name: "open_now", label: "Open Now" },
            ] as const).map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name={name} defaultChecked={!!venue?.[name]} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <SectionHeader label="Opening Hours" section="opening_hours" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <div className="space-y-2">
            {DAYS.map(({ key, label }) => {
              const day = openingHours[key]
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-medium text-slate-500 shrink-0">{label}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                    <input type="checkbox" checked={day.closed} onChange={(e) => setDay(key, { closed: e.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-800" />
                    <span className="text-xs text-slate-500">Closed</span>
                  </label>
                  <input type="time" value={day.open} disabled={day.closed} onChange={(e) => setDay(key, { open: e.target.value })} className="flex-1 min-w-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-40 disabled:bg-slate-50" />
                  <span className="text-xs text-slate-400 shrink-0">–</span>
                  <input type="time" value={day.close} disabled={day.closed} onChange={(e) => setDay(key, { close: e.target.value })} className="flex-1 min-w-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-40 disabled:bg-slate-50" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Google Photos */}
      {googlePhotos.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <SectionHeader label="Google Photos" section="photos" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle}>
              <span className={`text-xs font-medium ${selectedPhotos.length >= 5 ? "text-amber-600" : "text-slate-400"}`}>
                {selectedPhotos.length}/5 selected
              </span>
            </SectionHeader>
            <p className="text-xs text-slate-400 -mt-1">Click to select up to 5 photos shown in the app. First 5 are selected by default.</p>
            <div className="grid grid-cols-4 gap-2">
              {googlePhotos.map((url, i) => {
                const selIdx = selectedPhotos.indexOf(url)
                const isSelected = selIdx !== -1
                function toggle() {
                  if (isSelected) setSelectedPhotos((prev) => prev.filter((u) => u !== url))
                  else if (selectedPhotos.length < 5) setSelectedPhotos((prev) => [...prev, url])
                }
                return (
                  <div key={i} onClick={toggle}
                    className={`relative rounded-lg overflow-hidden aspect-video bg-slate-100 cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-indigo-500 ring-offset-1"
                        : selectedPhotos.length >= 5 ? "opacity-40 cursor-not-allowed"
                        : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
                    }`}
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold shadow">
                        {selIdx + 1}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 shrink-0">Selected order:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedPhotos.map((url, i) => (
                    <div key={i} className="relative h-8 w-12 rounded overflow-hidden bg-slate-100 shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/40">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media — edit mode only */}
      {mode === "edit" && venue?.id && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <SectionHeader label="Media" section="media" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
            <div className="grid grid-cols-3 gap-3">
              <PhotoSlot label="Logo" url={logoUrl} uploading={uploadingLogo} inputRef={logoInputRef} onPick={() => logoInputRef.current?.click()} onFile={(f) => handleUpload(f, "logo_url")} square />
              <PhotoSlot label="Cover" url={coverPhotoUrl} uploading={uploadingCover} inputRef={coverInputRef} onPick={() => coverInputRef.current?.click()} onFile={(f) => handleUpload(f, "cover_photo_url")} />
              <PhotoSlot label="Photo" url={photoUrl} uploading={uploadingPhoto} inputRef={photoInputRef} onPick={() => photoInputRef.current?.click()} onFile={(f) => handleUpload(f, "photo_url")} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeader label="Status" section="status" venueId={venueId} approvals={sectionApprovals} onToggle={handleSectionToggle} />
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" name="is_approved" defaultChecked={!!venue?.is_approved} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
            <span className="text-sm text-slate-700">Approved</span>
          </label>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2">
        {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
        {saved && !error && <p className="text-sm text-emerald-600 mr-auto">Saved!</p>}
        {!error && !saved && <span className="mr-auto" />}
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        ) : (
          <Button asChild variant="outline" type="button">
            <Link href="/dashboard/places">Cancel</Link>
          </Button>
        )}
        <Button type="submit" disabled={saving || isPending}>
          {saving || isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : mode === "new" ? "Create venue" : "Save venue"}
        </Button>
      </div>
    </form>
  )
}

// ── Section header with inline approve button ─────────────────────────────

interface SectionHeaderProps {
  label: string
  section: string
  venueId: string | undefined
  approvals: SectionApprovals
  onToggle: (section: string) => void
  children?: React.ReactNode
}

function SectionHeader({ label, section, venueId, approvals, onToggle, children }: SectionHeaderProps) {
  const approval = approvals[section]
  const currentUser = useUser()
  return (
    <div className="flex items-center justify-between gap-2 -mt-1">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{label}</h2>
      <div className="flex items-center gap-2">
        {children}
        <ApproveCircle
          approval={approval ?? null}
          currentUser={currentUser}
          onToggle={() => onToggle(section)}
        />
      </div>
    </div>
  )
}

function ApproveCircle({
  approval,
  currentUser,
  onToggle,
}: {
  approval: SectionApproval | null
  currentUser: ReturnType<typeof useUser>
  onToggle: () => void
}) {
  if (approval) {
    const displayName = approval.approver_name ?? approval.approved_by ?? "Admin"
    return (
      <button
        type="button"
        onClick={onToggle}
        title={`Approved by ${displayName} — click to revoke`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-500 hover:text-red-400 transition-colors"
      >
        <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Approve this section"
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
    >
      <CheckCircle2 className="h-5 w-5" />
    </button>
  )
}

// ── Photo upload slot ─────────────────────────────────────────────────────

interface PhotoSlotProps {
  label: string
  url: string | null
  uploading: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onPick: () => void
  onFile: (f: File) => void
  square?: boolean
}

function PhotoSlot({ label, url, uploading, inputRef, onPick, onFile, square }: PhotoSlotProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="rounded-lg border border-dashed border-slate-200 overflow-hidden">
        {url ? (
          <img src={url} alt={label} className={`w-full object-cover ${square ? "aspect-square" : "h-24"}`} />
        ) : (
          <div className={`w-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs ${square ? "aspect-square" : "h-24"}`}>
            No {label.toLowerCase()}
          </div>
        )}
        <div className="p-1.5">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
          <button type="button" disabled={uploading} onClick={onPick} className="w-full flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-slate-800 py-0.5">
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  )
}
