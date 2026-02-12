"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LocationRecord } from "@/lib/location-model";
import { getLocationTypeMeta } from "@/lib/location-types";

type LocationMapClientProps = {
  locations: LocationRecord[];
};

const DEFAULT_CENTER: [number, number] = [22.5, 10];
const DEFAULT_ZOOM = 2;

function getCenter(locations: LocationRecord[]): [number, number] {
  if (locations.length === 0) {
    return DEFAULT_CENTER;
  }

  const totals = locations.reduce(
    (acc, location) => {
      return {
        latitude: acc.latitude + location.latitude,
        longitude: acc.longitude + location.longitude,
      };
    },
    { latitude: 0, longitude: 0 },
  );

  return [totals.latitude / locations.length, totals.longitude / locations.length];
}

function buildMarkerIcon(toneClass: string) {
  return L.divIcon({
    className: "realfood-marker-root",
    html: `<span class="realfood-marker ${toneClass}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function LocationMapClient({ locations }: LocationMapClientProps) {
  const center = useMemo(() => getCenter(locations), [locations]);
  const iconMap = useMemo(() => {
    return {
      farm: buildMarkerIcon("marker-farm"),
      home: buildMarkerIcon("marker-home"),
      store: buildMarkerIcon("marker-store"),
      dropoff: buildMarkerIcon("marker-dropoff"),
    };
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-[58vh] min-h-[380px] w-full rounded-2xl sm:h-[62vh] sm:min-h-[460px] lg:h-[72vh]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => {
        const typeMeta = getLocationTypeMeta(location.type);

        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={iconMap[location.type]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{location.name}</p>
                <p className="text-xs text-muted-foreground">
                  {typeMeta?.label ?? location.type}
                </p>
                {location.description ? (
                  <p className="text-xs text-muted-foreground">
                    {location.description}
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
