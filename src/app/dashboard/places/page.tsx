import { getAllVenues } from "@/lib/data"
import { PlacesClient } from "./places-client"

export default async function PlacesPage() {
  const venues = await getAllVenues()
  return <PlacesClient venues={venues} />
}
