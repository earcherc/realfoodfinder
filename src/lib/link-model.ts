import type { LocationStatus } from "@/lib/location-types";

export type LinkRecord = {
  id: number;
  title: string;
  url: string;
  country: string;
  description: string | null;
  products: string[];
  tags: string[];
  submitterName: string | null;
  submitterEmail: string;
  status: LocationStatus;
  createdAt: Date;
  updatedAt: Date;
};
