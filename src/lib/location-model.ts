import type { LocationStatus, LocationType } from "@/lib/location-types";

export type LocationRecord = {
  id: number;
  name: string;
  type: LocationType;
  description: string | null;
  address: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  submitterName: string | null;
  submitterEmail: string | null;
  status: LocationStatus;
  createdAt: Date;
  updatedAt: Date;
};
