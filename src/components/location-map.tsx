"use client";

import dynamic from "next/dynamic";
import type { LocationRecord } from "@/lib/location-model";

const LocationMapClient = dynamic(
  () => import("@/components/location-map-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[58vh] min-h-[380px] w-full items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground sm:h-[62vh] sm:min-h-[460px] lg:h-[72vh]">
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
