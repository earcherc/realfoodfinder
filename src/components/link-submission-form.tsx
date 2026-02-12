"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import Turnstile from "react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LINK_PRODUCT_OPTIONS, TAG_OPTIONS } from "@/lib/location-types";

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return values.products.length > 0 && values.submitterEmail.trim().length > 0;
  }, [values.products.length, values.submitterEmail]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (turnstileSiteKey && !turnstileToken) {
        throw new Error("Please complete captcha verification.");
      }

      const response = await fetch("/api/links", {
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
        throw new Error(payload.message ?? "Could not submit link.");
      }

      setValues(DEFAULT_VALUES);
      setTurnstileToken("");
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
        <Input
          id="link-country"
          required
          value={values.country}
          onChange={(event) =>
            setValues((current) => ({ ...current, country: event.target.value }))
          }
          placeholder="United States"
        />
      </div>

      <div className="space-y-2">
        <Label>Product type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LINK_PRODUCT_OPTIONS.map((product) => (
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
        </div>
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
        </div>
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
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

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
          !canSubmit ||
          (Boolean(turnstileSiteKey) && !turnstileToken)
        }
        className="w-full"
      >
        {isSaving ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit link"
        )}
      </Button>
    </form>
  );
}
