"use client"

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
const LISBON = { lat: 38.716, lng: -9.142 }

interface LocationPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const center = lat != null && lng != null ? { lat, lng } : LISBON

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: 240 }} className="rounded-lg overflow-hidden border border-slate-200">
        <Map
          defaultCenter={center}
          center={center}
          defaultZoom={14}
          mapId="9ab330465c9479e585bd47d4"
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={(e) => {
            if (e.detail.latLng) {
              onChange(e.detail.latLng.lat, e.detail.latLng.lng)
            }
          }}
        >
          {lat != null && lng != null && (
            <AdvancedMarker
              position={{ lat, lng }}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) {
                  onChange(e.latLng.lat(), e.latLng.lng())
                }
              }}
            >
              <Pin background="#f59e0b" glyphColor="#fff" borderColor="#d97706" />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  )
}
