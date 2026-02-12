"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import Turnstile from "react-turnstile";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRY_OPTIONS, matchCountry } from "@/lib/countries";
import { LINK_PRODUCT_OPTIONS, TAG_OPTIONS } from "@/lib/location-types";
import { cn } from "@/lib/utils";

type FormValues = {
  title: string;
  url: string;
  country: string;
  description: string;
  products: string[];
  tags: string[];
  submitterName: string;
  submitterEmail: string;
};

const DEFAULT_VALUES: FormValues = {
  title: "",
  url: "",
  country: "",
  description: "",
  products: [],
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

export function LinkSubmissionForm() {
  const router = useRouter();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [countryOpen, setCountryOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [productOtherValue, setProductOtherValue] = useState("");
  const [tagOtherValue, setTagOtherValue] = useState("");
  const [showProductOtherInput, setShowProductOtherInput] = useState(false);
  const [showTagOtherInput, setShowTagOtherInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isSubmitted = Boolean(success);

  const productBaseOptions = useMemo(() => {
    return LINK_PRODUCT_OPTIONS.filter((item) => item !== "Other");
  }, []);
  const matchedCountry = useMemo(() => matchCountry(values.country), [values.country]);
  const customProducts = useMemo(() => {
    return values.products.filter((product) => {
      return (
        !productBaseOptions.includes(
          product as (typeof productBaseOptions)[number],
        ) && product.toLowerCase() !== "other"
      );
    });
  }, [productBaseOptions, values.products]);
  const customTags = useMemo(() => {
    return values.tags.filter(
      (tag) => !TAG_OPTIONS.includes(tag as (typeof TAG_OPTIONS)[number]),
    );
  }, [values.tags]);

  const canSubmit = useMemo(() => {
    return (
      values.products.length > 0 &&
      values.submitterEmail.trim().length > 0 &&
      Boolean(matchedCountry)
    );
  }, [matchedCountry, values.products.length, values.submitterEmail]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (turnstileSiteKey && !turnstileToken) {
        throw new Error("Please complete captcha verification.");
      }
      if (!matchedCountry) {
        throw new Error("Select a country from the list.");
      }

      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          country: matchedCountry,
          products: values.products.filter(
            (product) => product.toLowerCase() !== "other",
          ),
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Could not submit link.");
      }

      setValues(DEFAULT_VALUES);
      setTurnstileToken("");
      setProductOtherValue("");
      setTagOtherValue("");
      setShowProductOtherInput(false);
      setShowTagOtherInput(false);
      setSuccess("Submitted. Your link is now pending review.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not submit link.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="link-title">Name</Label>
        <Input
          id="link-title"
          required
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Spring Water Source"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-url">Link URL</Label>
        <Input
          id="link-url"
          required
          type="url"
          value={values.url}
          onChange={(event) =>
            setValues((current) => ({ ...current, url: event.target.value }))
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-country">Country</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              id="link-country"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className="w-full justify-between font-normal"
            >
              {matchedCountry ?? "Select country"}
              <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRY_OPTIONS.map((country) => (
                    <CommandItem
                      key={country}
                      value={country}
                      onSelect={(selectedValue) => {
                        const selectedCountry = matchCountry(selectedValue);

                        if (!selectedCountry) {
                          return;
                        }

                        setValues((current) => ({
                          ...current,
                          country: selectedCountry,
                        }));
                        setError(null);
                        setCountryOpen(false);
                      }}
                    >
                      {country}
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          matchedCountry === country ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Search and select a country from the list.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Product type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {productBaseOptions.map((product) => (
            <label
              key={product}
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={values.products.includes(product)}
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    products: toggleArrayValue(current.products, product),
                  }))
                }
              />
              <span>{product}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={showProductOtherInput || customProducts.length > 0}
              onChange={() => {
                const currentlyActive =
                  showProductOtherInput || customProducts.length > 0;

                if (currentlyActive) {
                  setValues((current) => ({
                    ...current,
                    products: current.products.filter((product) =>
                      productBaseOptions.includes(
                        product as (typeof productBaseOptions)[number],
                      ),
                    ),
                  }));
                  setProductOtherValue("");
                  setShowProductOtherInput(false);
                  return;
                }

                setShowProductOtherInput(true);
              }}
            />
            <span>Other</span>
          </label>
        </div>
        {showProductOtherInput || customProducts.length > 0 ? (
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={productOtherValue}
                onChange={(event) => setProductOtherValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();
                  setValues((current) => ({
                    ...current,
                    products: addCustomValue(current.products, productOtherValue),
                  }));
                  setProductOtherValue("");
                }}
                placeholder="Add custom product"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValues((current) => ({
                    ...current,
                    products: addCustomValue(current.products, productOtherValue),
                  }));
                  setProductOtherValue("");
                }}
              >
                Add
              </Button>
            </div>
            {customProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {customProducts.map((product) => (
                  <label
                    key={product}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() =>
                        setValues((current) => ({
                          ...current,
                          products: current.products.filter((item) => item !== product),
                        }))
                      }
                    />
                    <span>{product}</span>
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
        <Label htmlFor="link-description">Description</Label>
        <Textarea
          id="link-description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="What this source offers and why it is useful."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="link-submitter-name">Your name (optional)</Label>
          <Input
            id="link-submitter-name"
            value={values.submitterName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                submitterName: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-submitter-email">Your email</Label>
          <Input
            id="link-submitter-email"
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
      

      {turnstileSiteKey ? (
        <div className="pt-1">
          <Turnstile
            sitekey={turnstileSiteKey}
            action="submit_link"
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
        disabled={
          isSaving ||
          isSubmitted ||
          !canSubmit ||
          (Boolean(turnstileSiteKey) && !turnstileToken)
        }
        className={cn(
          "w-full",
          isSubmitted &&
            "bg-emerald-700 text-white hover:bg-emerald-700 disabled:opacity-100",
        )}
      >
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Submitting...
          </span>
        ) : isSubmitted ? (
          "Submitted for review"
        ) : (
          "Submit link"
        )}
      </Button>
    </form>
  );
}
