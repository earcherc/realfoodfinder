"use client";

import dynamic from "next/dynamic";
import type { LocationRecord } from "@/lib/location-model";

const LocationMapClient = dynamic(
  () => import("@/components/location-map-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60vh] min-h-[420px] w-full items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

type LocationMapProps = {
  locations: LocationRecord[];
};

export function LocationMap({ locations }: LocationMapProps) {
  return <LocationMapClient locations={locations} />;
}
