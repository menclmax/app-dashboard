"use client"

import { useEffect, useState } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps"
import type { Venue } from "@/lib/data"
import { MapPin, Star } from "lucide-react"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

function markerColor(venue: Venue, active: boolean) {
  if (active) return { bg: "#6366f1", glyph: "#fff", border: "#4338ca" }
  if (venue.is_approved) return { bg: "#10b981", glyph: "#fff", border: "#059669" }
  if (venue.is_user_submitted) return { bg: "#f59e0b", glyph: "#fff", border: "#d97706" }
  return { bg: "#64748b", glyph: "#fff", border: "#475569" }
}

function PanToActive({ activeId, venues }: { activeId: string | null; venues: Venue[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !activeId) return
    const v = venues.find((v) => v.id === activeId)
    if (v?.lat != null && v?.lng != null) {
      map.panTo({ lat: v.lat, lng: v.lng })
    }
  }, [activeId, map])
  return null
}

export function VenuesMap({
  venues,
  activeId,
  onSelect,
}: {
  venues: Venue[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const [infoVenue, setInfoVenue] = useState<Venue | null>(null)
  const withCoords = venues.filter((v) => v.lat != null && v.lng != null)

  if (withCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
        No venues with coordinates
      </div>
    )
  }

  const avgLat = withCoords.reduce((s, v) => s + v.lat, 0) / withCoords.length
  const avgLng = withCoords.reduce((s, v) => s + v.lng, 0) / withCoords.length

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={{ lat: avgLat, lng: avgLng }}
        defaultZoom={14}
        mapId="9ab330465c9479e585bd47d4"
        className="w-full h-full"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <PanToActive activeId={activeId} venues={withCoords} />

        {withCoords.map((venue) => {
          const active = venue.id === activeId
          const colors = markerColor(venue, active)
          return (
            <AdvancedMarker
              key={venue.id}
              position={{ lat: venue.lat, lng: venue.lng }}
              onClick={() => {
                onSelect(venue.id)
                setInfoVenue(venue)
              }}
              zIndex={active ? 10 : 1}
            >
              <Pin
                background={colors.bg}
                glyphColor={colors.glyph}
                borderColor={colors.border}
                scale={active ? 1.3 : 1}
              />
            </AdvancedMarker>
          )
        })}

        {infoVenue && (
          <InfoWindow
            position={{ lat: infoVenue.lat, lng: infoVenue.lng }}
            onCloseClick={() => setInfoVenue(null)}
            pixelOffset={[0, -40]}
          >
            <div className="font-sans text-slate-800 min-w-[160px] max-w-[220px]">
              <p className="font-semibold text-[13px] leading-snug mb-1">{infoVenue.name}</p>
              {infoVenue.address && (
                <p className="text-[11px] text-slate-500 mb-1.5">{infoVenue.address}</p>
              )}
              <div className="flex items-center gap-2 text-[11px]">
                {infoVenue.rating != null && (
                  <span className="flex items-center gap-0.5 text-yellow-500 font-medium">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {Number(infoVenue.rating).toFixed(1)}
                    {infoVenue.review_count ? (
                      <span className="text-slate-400 font-normal ml-0.5">({infoVenue.review_count})</span>
                    ) : null}
                  </span>
                )}
                {infoVenue.price_range && (
                  <span className="text-slate-500">{"€".repeat(infoVenue.price_range)}</span>
                )}
              </div>
              {infoVenue.tags?.length ? (
                <p className="text-[10px] text-slate-400 mt-1.5">{infoVenue.tags.slice(0, 3).join(" · ")}</p>
              ) : null}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  )
}
