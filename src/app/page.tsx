import Link from "next/link";
import { Globe, MapPinned } from "lucide-react";
import { LocationCard } from "@/components/location-card";
import { LocationMap } from "@/components/location-map";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listApprovedLocations } from "@/lib/location-repository";
import { LOCATION_TYPES } from "@/lib/location-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locations = await listApprovedLocations();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <Globe className="size-3.5" />
            Global sourcing network for real food
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Connecting people to real food around the world
            </h1>
          </div>
        </section>

        <section>
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="inline-flex items-center gap-2">
                <MapPinned className="size-4 text-emerald-700" />
                Global map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap locations={locations} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {LOCATION_TYPES.map((item) => (
              <Badge key={item.value} className={item.tone}>
                {item.label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Recently approved
            </h2>
            <Button asChild variant="outline">
              <Link href="/locations">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {locations
              .slice(0, 6)
              .map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  className="border-border/70"
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
