export const LOCATION_TYPES = [
  { value: "farm", label: "Farm", tone: "bg-emerald-100 text-emerald-800" },
  { value: "home", label: "Home", tone: "bg-sky-100 text-sky-800" },
  { value: "store", label: "Store", tone: "bg-amber-100 text-amber-900" },
  { value: "dropoff", label: "Drop Off", tone: "bg-violet-100 text-violet-800" },
] as const;

export const LOCATION_STATUSES = [
  { value: "pending", label: "Pending", tone: "bg-amber-100 text-amber-900" },
  { value: "approved", label: "Approved", tone: "bg-emerald-100 text-emerald-800" },
  { value: "rejected", label: "Rejected", tone: "bg-rose-100 text-rose-800" },
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number]["value"];
export type LocationStatus = (typeof LOCATION_STATUSES)[number]["value"];

export const LOCATION_TYPE_VALUES = LOCATION_TYPES.map((item) => item.value);
export const LOCATION_STATUS_VALUES = LOCATION_STATUSES.map((item) => item.value);

export function getLocationTypeMeta(type: LocationType) {
  return LOCATION_TYPES.find((item) => item.value === type);
}

export function getLocationStatusMeta(status: LocationStatus) {
  return LOCATION_STATUSES.find((item) => item.value === status);
}
