"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOCATION_TYPES } from "@/lib/location-types";

type FormValues = {
  name: string;
  type: (typeof LOCATION_TYPES)[number]["value"];
  description: string;
  address: string;
  country: string;
  latitude: string;
  longitude: string;
  submitterName: string;
  submitterEmail: string;
};

const DEFAULT_VALUES: FormValues = {
  name: "",
  type: "farm",
  description: "",
  address: "",
  country: "",
  latitude: "",
  longitude: "",
  submitterName: "",
  submitterEmail: "",
};

export function LocationSubmissionForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Could not submit location.");
      }

      setValues(DEFAULT_VALUES);
      setSuccess("Submitted. Your location is now pending review.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit location.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="location-name">Name</Label>
        <Input
          id="location-name"
          required
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Green Valley Farm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-type">Type</Label>
        <Select
          value={values.type}
          onValueChange={(nextValue) =>
            setValues((current) => ({
              ...current,
              type: nextValue as FormValues["type"],
            }))
          }
        >
          <SelectTrigger id="location-type">
            <SelectValue placeholder="Choose location type" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location-latitude">Latitude</Label>
          <Input
            id="location-latitude"
            required
            type="number"
            inputMode="decimal"
            step="any"
            min={-90}
            max={90}
            value={values.latitude}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                latitude: event.target.value,
              }))
            }
            placeholder="40.7128"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-longitude">Longitude</Label>
          <Input
            id="location-longitude"
            required
            type="number"
            inputMode="decimal"
            step="any"
            min={-180}
            max={180}
            value={values.longitude}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                longitude: event.target.value,
              }))
            }
            placeholder="-74.0060"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-description">Description</Label>
        <Textarea
          id="location-description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="What food is available and how people can source it."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location-address">Address / Area</Label>
          <Input
            id="location-address"
            value={values.address}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
            placeholder="City, neighborhood, or pickup point"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-country">Country</Label>
          <Input
            id="location-country"
            value={values.country}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
            placeholder="United States"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="submitter-name">Your Name (optional)</Label>
          <Input
            id="submitter-name"
            value={values.submitterName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                submitterName: event.target.value,
              }))
            }
            placeholder="Farmer or organizer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="submitter-email">Your Email (optional)</Label>
          <Input
            id="submitter-email"
            type="email"
            value={values.submitterEmail}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                submitterEmail: event.target.value,
              }))
            }
            placeholder="you@email.com"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit location"
        )}
      </Button>
    </form>
  );
}
