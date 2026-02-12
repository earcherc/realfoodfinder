import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listApprovedLocations } from "@/lib/location-repository";
import { getLocationTypeMeta } from "@/lib/location-types";

export default async function LocationsPage() {
  const locations = await listApprovedLocations();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Approved Locations</h1>
        <p className="text-sm text-muted-foreground">
          Verified food sources and drop points currently visible in Real Food Finder.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const typeMeta = getLocationTypeMeta(location.type);

          return (
            <Card key={location.id} className="h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{location.name}</CardTitle>
                  <Badge className={typeMeta?.tone}>{typeMeta?.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {location.description ? (
                  <p className="text-sm text-muted-foreground">
                    {location.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description submitted yet.
                  </p>
                )}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Coordinates: {location.latitude.toFixed(4)},{" "}
                    {location.longitude.toFixed(4)}
                  </p>
                  {location.country ? <p>Country: {location.country}</p> : null}
                  {location.address ? <p>Area: {location.address}</p> : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
