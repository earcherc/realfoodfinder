import Link from "next/link";
import { Globe, MapPinned } from "lucide-react";
import { LocationMap } from "@/components/location-map";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listApprovedLocations } from "@/lib/location-repository";
import { LOCATION_TYPES, getLocationTypeMeta } from "@/lib/location-types";

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
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Connect farmers, homes, stores, and drop points around the world.
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Real Food Finder maps where real food is available, so buyers can
              source directly and communities can organize resilient local supply.
            </p>
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
            {locations.slice(0, 6).map((location) => {
              const typeMeta = getLocationTypeMeta(location.type);

              return (
                <Card key={location.id} className="border-border/70">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">{location.name}</CardTitle>
                      <Badge className={typeMeta?.tone}>{typeMeta?.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{location.description ?? "No description submitted yet."}</p>
                    {location.address ? <p>Place: {location.address}</p> : null}
                    {location.foods.length > 0 ? (
                      <p>Food: {location.foods.join(", ")}</p>
                    ) : null}
                    {location.tags.length > 0 ? (
                      <p>Tags: {location.tags.join(", ")}</p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
