"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";
import type { LocationRecord } from "@/lib/location-model";
import {
  FOOD_OPTIONS,
  LOCATION_TYPES,
  TAG_OPTIONS,
  type LocationType,
} from "@/lib/location-types";
import { cn } from "@/lib/utils";

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

const TYPE_DOT_STYLES: Record<LocationType, string> = {
  farm: "bg-emerald-700",
  home: "bg-sky-700",
  store: "bg-amber-700",
  dropoff: "bg-violet-700",
  other: "bg-slate-700",
};

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function LocationMap({ locations }: LocationMapProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const typeMatch =
        selectedTypes.length === 0 || selectedTypes.includes(location.type);
      const foodMatch = selectedFoods.every((food) => location.foods.includes(food));
      const tagMatch = selectedTags.every((tag) => location.tags.includes(tag));

      return typeMatch && foodMatch && tagMatch;
    });
  }, [locations, selectedFoods, selectedTags, selectedTypes]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <LocationMapClient locations={filteredLocations} />
        <button
          type="button"
          onClick={() => {
            document.getElementById("map-filters")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
        </button>
      </div>

      <div
        id="map-filters"
        className="space-y-4 rounded-xl border border-border/70 bg-background/85 p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Showing {filteredLocations.length} of {locations.length} locations
          </p>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelectedTypes([]);
              setSelectedFoods([]);
              setSelectedTags([]);
            }}
          >
            Clear filters
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Legend and type filter
          </p>
          <div className="flex flex-wrap gap-2">
            {LOCATION_TYPES.map((type) => {
              const selected = selectedTypes.includes(type.value);

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setSelectedTypes((current) => toggleValue(current, type.value))
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      TYPE_DOT_STYLES[type.value],
                    )}
                  />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Food filter
          </p>
          <div className="flex flex-wrap gap-2">
            {FOOD_OPTIONS.map((food) => {
              const selected = selectedFoods.includes(food);

              return (
                <button
                  key={food}
                  type="button"
                  onClick={() =>
                    setSelectedFoods((current) => toggleValue(current, food))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    selected
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {food}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tag filter
          </p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const selected = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTags((current) => toggleValue(current, tag))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    selected
                      ? "border-sky-700 bg-sky-700 text-white"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
