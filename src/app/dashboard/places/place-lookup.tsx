"use client"

import { useEffect, useRef, useState } from "react"
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps"
import { type Venue, type OpeningHours } from "@/lib/data"
import { Link2, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export type PlaceFill = Partial<Pick<
  Venue,
  "name" | "address" | "lat" | "lng" | "google_place_id" | "price_range" | "tags" | "opening_hours" | "google_photos" | "selected_photos"
>>

function extractPlaceId(url: string): string | null {
  const chijMatch = url.match(/!1s(ChIJ[^!&]+)/)
  if (chijMatch) return decodeURIComponent(chijMatch[1])
  return null
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  return null
}

function extractNameFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/maps\/place\/([^/@]+)/)
    if (match) return decodeURIComponent(match[1].replace(/\+/g, " "))
  } catch {}
  return null
}

const PLACE_TYPE_TO_TAGS: Record<string, string> = {
  cafe: "café",
  restaurant: "restaurant",
  bar: "bar",
  bakery: "bakery",
  food: "food",
  meal_takeaway: "takeaway",
  night_club: "nightclub",
  library: "library",
  park: "park",
  gym: "gym",
  spa: "spa",
  book_store: "bookstore",
  meal_delivery: "delivery",
  coffee: "coffee",
}

const DAY_MAP = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

const DETAIL_FIELDS = [
  "name", "formatted_address", "geometry",
  "price_level", "types", "place_id",
  "opening_hours", "photos",
]

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

function PlaceLookupInner({ onResult }: { onResult: (data: PlaceFill) => void }) {
  const placesLib = useMapsLibrary("places")
  const geocodingLib = useMapsLibrary("geocoding")
  const divRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (placesLib && divRef.current && !serviceRef.current) {
      serviceRef.current = new placesLib.PlacesService(divRef.current)
    }
  }, [placesLib])

  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new geocodingLib.Geocoder()
    }
  }, [geocodingLib])

  async function lookup(rawUrl: string) {
    if (!rawUrl.trim()) return
    setStatus("loading")
    setErrorMsg("")

    const placeId = extractPlaceId(rawUrl)
    const coordsFallback = extractCoords(rawUrl)
    const nameFallback = extractNameFromUrl(rawUrl)

    if (!placeId) {
      if (!nameFallback && !coordsFallback) {
        setStatus("error")
        setErrorMsg("Couldn't parse this URL. Try a full Google Maps place link.")
        return
      }

      if (serviceRef.current && nameFallback) {
        const searchOpts: google.maps.places.TextSearchRequest = {
          query: nameFallback,
          ...(coordsFallback ? { location: coordsFallback, radius: 200 } : {}),
        }
        serviceRef.current.textSearch(searchOpts, (results, tsStatus) => {
          if (
            tsStatus === google.maps.places.PlacesServiceStatus.OK &&
            results?.[0]?.place_id
          ) {
            serviceRef.current!.getDetails(
              { placeId: results[0].place_id, fields: DETAIL_FIELDS },
              (place, detailStatus) => {
                if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !place) {
                  applyUrlFallback()
                  return
                }
                onResult(buildFill(place))
                setStatus("ok")
              }
            )
          } else {
            applyUrlFallback()
          }
        })
        return
      }

      applyUrlFallback()
      return

      function applyUrlFallback() {
        const fill: PlaceFill = {}
        if (nameFallback) fill.name = nameFallback
        if (coordsFallback) { fill.lat = coordsFallback.lat; fill.lng = coordsFallback.lng }
        if (coordsFallback && geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: coordsFallback },
            (results, geoStatus) => {
              if (geoStatus === google.maps.GeocoderStatus.OK && results?.[0]) {
                fill.address = results[0].formatted_address
              }
              onResult(fill)
              setStatus("ok")
            }
          )
          return
        }
        onResult(fill)
        setStatus("ok")
      }
    }

    if (!serviceRef.current) {
      setStatus("error")
      setErrorMsg("Maps API not ready yet, try again.")
      return
    }

    serviceRef.current.getDetails(
      { placeId, fields: DETAIL_FIELDS },
      (place, detailStatus) => {
        if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !place) {
          setStatus("error")
          setErrorMsg("Place not found. Try copying the URL from the browser address bar.")
          return
        }
        onResult(buildFill(place))
        setStatus("ok")
      }
    )
  }

  function buildFill(place: google.maps.places.PlaceResult): PlaceFill {
    const fill: PlaceFill = {}
    if (place.name) fill.name = place.name
    if (place.formatted_address) fill.address = place.formatted_address
    if (place.geometry?.location) {
      fill.lat = place.geometry.location.lat()
      fill.lng = place.geometry.location.lng()
    }
    if (place.place_id) fill.google_place_id = place.place_id
    if (place.price_level != null) fill.price_range = Math.min(3, Math.max(1, place.price_level)) as 1 | 2 | 3
    if (place.types) {
      const tags = place.types.map((t) => PLACE_TYPE_TO_TAGS[t]).filter(Boolean) as string[]
      if (tags.length > 0) fill.tags = tags
    }

    // Opening hours
    if (place.opening_hours?.periods) {
      const hours: OpeningHours = {}
      for (const day of DAY_MAP) hours[day] = { open: "09:00", close: "22:00", closed: true }
      for (const period of place.opening_hours.periods) {
        const day = DAY_MAP[period.open.day]
        if (day) {
          const fmt = (t: string) => t.replace(/(\d{2})(\d{2})/, "$1:$2")
          hours[day] = {
            open: fmt(period.open.time),
            close: period.close ? fmt(period.close.time) : "23:59",
            closed: false,
          }
        }
      }
      fill.opening_hours = hours
    }

    // Photos — fetch up to 20, default-select first 5
    if (place.photos && place.photos.length > 0) {
      const all = place.photos.slice(0, 20).map((p) => p.getUrl({ maxWidth: 1200 }))
      fill.google_photos = all
      fill.selected_photos = all.slice(0, 5)
    }

    return fill
  }

  return (
    <div className="space-y-2">
      <div ref={divRef} className="hidden" />

      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
        Import from Google Maps
      </label>

      <div className="relative">
        <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setStatus("idle") }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text")
            setUrl(pasted)
            setStatus("idle")
            setTimeout(() => lookup(pasted), 0)
          }}
          onBlur={() => { if (url) lookup(url) }}
          placeholder="Paste a Google Maps place URL…"
          className="pl-8 pr-8 text-sm"
        />
        {status === "loading" && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />}
        {status === "ok" && <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />}
        {status === "error" && <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-red-400" />}
      </div>

      {status === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
      {status === "ok" && <p className="text-xs text-emerald-600">Fields filled in — review and adjust as needed.</p>}
    </div>
  )
}

export function PlaceLookup({ onResult }: { onResult: (data: PlaceFill) => void }) {
  return (
    <APIProvider apiKey={API_KEY}>
      <PlaceLookupInner onResult={onResult} />
    </APIProvider>
  )
}
