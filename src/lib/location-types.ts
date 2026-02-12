export const LOCATION_TYPES = [
  { value: "farm", label: "Farm", tone: "bg-emerald-100 text-emerald-800" },
  { value: "home", label: "Home", tone: "bg-sky-100 text-sky-800" },
  { value: "store", label: "Store", tone: "bg-amber-100 text-amber-900" },
  { value: "dropoff", label: "Drop Off", tone: "bg-violet-100 text-violet-800" },
  { value: "other", label: "Other", tone: "bg-slate-100 text-slate-800" },
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

export const FOOD_OPTIONS = [
  "Milk",
  "Eggs",
  "Beef",
  "Chicken",
  "Pork",
  "Lamb",
  "Vegetables",
  "Fruit",
  "Honey",
  "Butter",
  "Cheese",
] as const;

export const TAG_OPTIONS = [
  "Raw",
  "Unheated",
  "Unfiltered",
  "Organic",
  "No Spray",
  "Pasture-Raised",
  "Grass-Fed",
  "Regenerative",
] as const;

export const LINK_PRODUCT_OPTIONS = [
  "Water",
  "Honey",
  "Clay",
  "Other",
] as const;

export function getLocationTypeMeta(type: LocationType) {
  return LOCATION_TYPES.find((item) => item.value === type);
}

export function getLocationStatusMeta(status: LocationStatus) {
  return LOCATION_STATUSES.find((item) => item.value === status);
}
