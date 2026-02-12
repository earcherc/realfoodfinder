import { LocationCard } from "@/components/location-card";
import { SiteHeader } from "@/components/site-header";
import { listApprovedLocations } from "@/lib/location-repository";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const locations = await listApprovedLocations();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Approved Locations</h1>
          <p className="text-sm text-muted-foreground">
            Verified food sources and drop points currently visible in Real Food
            Finder.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </div>
  );
}
