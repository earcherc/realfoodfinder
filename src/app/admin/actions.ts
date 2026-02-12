"use server";

import { revalidatePath } from "next/cache";
import { LOCATION_STATUS_VALUES } from "@/lib/location-types";
import { updateLinkStatus } from "@/lib/link-repository";
import { updateLocationStatus } from "@/lib/location-repository";

export async function updateLocationStatusAction(formData: FormData) {
  const expectedKey = process.env.ADMIN_DASHBOARD_KEY;
  const providedKey = String(formData.get("adminKey") ?? "");

  if (expectedKey && expectedKey !== providedKey) {
    throw new Error("Invalid admin key.");
  }

  const idValue = Number(formData.get("id"));
  const statusValue = String(formData.get("status"));

  if (!Number.isInteger(idValue) || idValue <= 0) {
    throw new Error("Invalid location id.");
  }

  if (!LOCATION_STATUS_VALUES.includes(statusValue as (typeof LOCATION_STATUS_VALUES)[number])) {
    throw new Error("Invalid status.");
  }

  await updateLocationStatus({
    id: idValue,
    status: statusValue as (typeof LOCATION_STATUS_VALUES)[number],
  });

  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/admin");
}

export async function updateLinkStatusAction(formData: FormData) {
  const expectedKey = process.env.ADMIN_DASHBOARD_KEY;
  const providedKey = String(formData.get("adminKey") ?? "");

  if (expectedKey && expectedKey !== providedKey) {
    throw new Error("Invalid admin key.");
  }

  const idValue = Number(formData.get("id"));
  const statusValue = String(formData.get("status"));

  if (!Number.isInteger(idValue) || idValue <= 0) {
    throw new Error("Invalid link id.");
  }

  if (
    !LOCATION_STATUS_VALUES.includes(
      statusValue as (typeof LOCATION_STATUS_VALUES)[number],
    )
  ) {
    throw new Error("Invalid status.");
  }

  await updateLinkStatus({
    id: idValue,
    status: statusValue as (typeof LOCATION_STATUS_VALUES)[number],
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/links");
}
