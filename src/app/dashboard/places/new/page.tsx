import { Header } from "@/components/layout/header"
import { VenueForm } from "../venue-form"

export default function NewVenuePage() {
  return (
    <main className="flex-1">
      <Header
        title="New Venue"
        breadcrumb={[
          { label: "Places", href: "/dashboard/places" },
          { label: "New Venue", href: "/dashboard/places/new" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <VenueForm mode="new" />
      </div>
    </main>
  )
}
