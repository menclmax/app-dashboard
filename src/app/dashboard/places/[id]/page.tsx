import { getVenueById } from "@/lib/data"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { VenueForm } from "../venue-form"

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const venue = await getVenueById(id)
  if (!venue) notFound()
  return (
    <main className="flex-1">
      <Header
        title={venue.name}
        breadcrumb={[
          { label: "Places", href: "/dashboard/places" },
          { label: venue.name, href: `/dashboard/places/${venue.id}` },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <VenueForm mode="edit" venue={venue} />
      </div>
    </main>
  )
}
