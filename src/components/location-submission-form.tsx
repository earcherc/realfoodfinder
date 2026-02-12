"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import Turnstile from "react-turnstile";
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
import {
  FOOD_OPTIONS,
  LOCATION_TYPES,
  TAG_OPTIONS,
} from "@/lib/location-types";

type FormValues = {
  name: string;
  type: (typeof LOCATION_TYPES)[number]["value"];
  address: string;
  description: string;
  foods: string[];
  tags: string[];
  submitterName: string;
  submitterEmail: string;
};

const DEFAULT_VALUES: FormValues = {
  name: "",
  type: "farm",
  address: "",
  description: "",
  foods: [],
  tags: [],
  submitterName: "",
  submitterEmail: "",
};

function toggleArrayValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function addCustomValue(list: string[], rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return list;
  }

  if (list.some((item) => item.toLowerCase() === value.toLowerCase())) {
    return list;
  }

  return [...list, value];
}

function turnstileErrorMessage(error: unknown) {
  const code =
    typeof error === "string"
      ? error
      : typeof error === "number"
        ? String(error)
        : "";

  if (code === "110200") {
    return "Captcha is not enabled for this domain yet (110200).";
  }

  return "Captcha failed to load. Please refresh and try again.";
}

export function LocationSubmissionForm() {
  const router = useRouter();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [foodOtherValue, setFoodOtherValue] = useState("");
  const [tagOtherValue, setTagOtherValue] = useState("");
  const [showFoodOtherInput, setShowFoodOtherInput] = useState(false);
  const [showTagOtherInput, setShowTagOtherInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const customFoods = useMemo(() => {
    return values.foods.filter(
      (food) => !FOOD_OPTIONS.includes(food as (typeof FOOD_OPTIONS)[number]),
    );
  }, [values.foods]);
  const customTags = useMemo(() => {
    return values.tags.filter(
      (tag) => !TAG_OPTIONS.includes(tag as (typeof TAG_OPTIONS)[number]),
    );
  }, [values.tags]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (turnstileSiteKey && !turnstileToken) {
        throw new Error("Please complete captcha verification.");
      }

      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Could not submit location.");
      }

      setValues(DEFAULT_VALUES);
      setTurnstileToken("");
      setFoodOtherValue("");
      setTagOtherValue("");
      setShowFoodOtherInput(false);
      setShowTagOtherInput(false);
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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="location-name">Location name</Label>
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

      <div className="space-y-2">
        <Label htmlFor="location-address">Street address or place name</Label>
        <Input
          id="location-address"
          required
          value={values.address}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              address: event.target.value,
            }))
          }
          placeholder="123 Main St, Austin TX or Sunrise Organic Market"
        />
        <p className="text-xs text-muted-foreground">
          We geocode this automatically to place the marker on the map.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Food available</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FOOD_OPTIONS.map((food) => (
            <label
              key={food}
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={values.foods.includes(food)}
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    foods: toggleArrayValue(current.foods, food),
                  }))
                }
              />
              <span>{food}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={showFoodOtherInput || customFoods.length > 0}
              onChange={() => {
                const currentlyActive = showFoodOtherInput || customFoods.length > 0;

                if (currentlyActive) {
                  setValues((current) => ({
                    ...current,
                    foods: current.foods.filter((food) =>
                      FOOD_OPTIONS.includes(food as (typeof FOOD_OPTIONS)[number]),
                    ),
                  }));
                  setFoodOtherValue("");
                  setShowFoodOtherInput(false);
                  return;
                }

                setShowFoodOtherInput(true);
              }}
            />
            <span>Other</span>
          </label>
        </div>
        {showFoodOtherInput || customFoods.length > 0 ? (
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={foodOtherValue}
                onChange={(event) => setFoodOtherValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();
                  setValues((current) => ({
                    ...current,
                    foods: addCustomValue(current.foods, foodOtherValue),
                  }));
                  setFoodOtherValue("");
                }}
                placeholder="Add custom food"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues((current) => ({
                    ...current,
                    foods: addCustomValue(current.foods, foodOtherValue),
                  }));
                  setFoodOtherValue("");
                }}
              >
                Add
              </Button>
            </div>
            {customFoods.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {customFoods.map((food) => (
                  <label
                    key={food}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() =>
                        setValues((current) => ({
                          ...current,
                          foods: current.foods.filter((item) => item !== food),
                        }))
                      }
                    />
                    <span>{food}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TAG_OPTIONS.map((tag) => (
            <label
              key={tag}
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={values.tags.includes(tag)}
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    tags: toggleArrayValue(current.tags, tag),
                  }))
                }
              />
              <span>{tag}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={showTagOtherInput || customTags.length > 0}
              onChange={() => {
                const currentlyActive = showTagOtherInput || customTags.length > 0;

                if (currentlyActive) {
                  setValues((current) => ({
                    ...current,
                    tags: current.tags.filter((tag) =>
                      TAG_OPTIONS.includes(tag as (typeof TAG_OPTIONS)[number]),
                    ),
                  }));
                  setTagOtherValue("");
                  setShowTagOtherInput(false);
                  return;
                }

                setShowTagOtherInput(true);
              }}
            />
            <span>Other</span>
          </label>
        </div>
        {showTagOtherInput || customTags.length > 0 ? (
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={tagOtherValue}
                onChange={(event) => setTagOtherValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();
                  setValues((current) => ({
                    ...current,
                    tags: addCustomValue(current.tags, tagOtherValue),
                  }));
                  setTagOtherValue("");
                }}
                placeholder="Add custom tag"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues((current) => ({
                    ...current,
                    tags: addCustomValue(current.tags, tagOtherValue),
                  }));
                  setTagOtherValue("");
                }}
              >
                Add
              </Button>
            </div>
            {customTags.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {customTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() =>
                        setValues((current) => ({
                          ...current,
                          tags: current.tags.filter((item) => item !== tag),
                        }))
                      }
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
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
          placeholder="Share pickup times, sourcing details, and contact expectations."
          rows={7}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="submitter-name">Your name (optional)</Label>
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
          <Label htmlFor="submitter-email">Your email</Label>
          <Input
            id="submitter-email"
            required
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

      {turnstileSiteKey ? (
        <div className="pt-1">
          <Turnstile
            sitekey={turnstileSiteKey}
            action="submit_location"
            onVerify={(token) => {
              setTurnstileToken(token);
            }}
            onExpire={() => {
              setTurnstileToken("");
              setError("Captcha expired. Please verify again.");
            }}
            onError={(turnstileError) => {
              setTurnstileToken("");
              setError(turnstileErrorMessage(turnstileError));
            }}
            theme="light"
            size="flexible"
            refreshExpired="auto"
          />
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSaving || (Boolean(turnstileSiteKey) && !turnstileToken)}
        className="w-full"
      >
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
