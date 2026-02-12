import Link from "next/link";
import { Globe, Leaf, MapPinned } from "lucide-react";
import { LocationMap } from "@/components/location-map";
import { LocationSubmissionForm } from "@/components/location-submission-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listApprovedLocations } from "@/lib/location-repository";
import { LOCATION_TYPES, getLocationTypeMeta } from "@/lib/location-types";

export default async function Home() {
  const locations = await listApprovedLocations();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <header className="border-b border-emerald-100/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Leaf className="size-4 text-emerald-700" />
            Real Food Finder
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/locations">Locations</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-emerald-700">
            <Globe className="size-3.5" />
            Global sourcing network for real food
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Connect farmers, homes, stores, and drop points around the world.
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Real Food Finder maps where real food is available, so buyers can
              source directly and communities can organize resilient local supply.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="inline-flex items-center gap-2">
                <MapPinned className="size-4 text-emerald-700" />
                Live map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Approved locations appear here first so visitors can find nearby
                real-food sources quickly.
              </p>
            </CardHeader>
            <CardContent>
              <LocationMap locations={locations} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-emerald-100 shadow-sm">
              <CardHeader>
                <CardTitle>Submit a location</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationSubmissionForm />
              </CardContent>
            </Card>

            <Card className="border-emerald-100 shadow-sm">
              <CardHeader>
                <CardTitle>Location types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {LOCATION_TYPES.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <Badge className={item.tone}>{item.value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
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
                    {location.country ? <p>Country: {location.country}</p> : null}
                    {location.address ? <p>Area: {location.address}</p> : null}
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
