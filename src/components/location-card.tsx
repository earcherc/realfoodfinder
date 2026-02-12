import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationRecord } from "@/lib/location-model";
import { getLocationTypeMeta } from "@/lib/location-types";
import { cn } from "@/lib/utils";

type LocationCardProps = {
  location: LocationRecord;
  className?: string;
};

export function LocationCard({ location, className }: LocationCardProps) {
  const typeMeta = getLocationTypeMeta(location.type);

  return (
    <Card className={cn("h-full gap-4", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{location.name}</CardTitle>
          <Badge className={typeMeta?.tone}>{typeMeta?.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {location.description ? (
          <p className="text-sm text-muted-foreground">{location.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No description submitted yet.</p>
        )}
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
          {location.address ? <p>Place: {location.address}</p> : null}
          {location.foods.length > 0 ? <p>Food: {location.foods.join(", ")}</p> : null}
          {location.tags.length > 0 ? <p>Tags: {location.tags.join(", ")}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
