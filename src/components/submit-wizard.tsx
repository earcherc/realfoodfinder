"use client";

import { useState } from "react";
import { ArrowLeft, Link as LinkIcon, MapPinPlus } from "lucide-react";
import { LinkSubmissionForm } from "@/components/link-submission-form";
import { LocationSubmissionForm } from "@/components/location-submission-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SubmitMode = "location" | "link";

export function SubmitWizard() {
  const [mode, setMode] = useState<SubmitMode | null>(null);

  if (!mode) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("location")}
          className="min-h-36 rounded-xl border bg-background p-5 text-left transition hover:bg-muted"
        >
          <MapPinPlus className="mb-3 size-5" />
          <p className="text-lg font-semibold">Submit Location</p>
          <p className="text-sm text-muted-foreground">
            Farms, stores, homes, and drop points.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className="min-h-36 rounded-xl border bg-background p-5 text-left transition hover:bg-muted"
        >
          <LinkIcon className="mb-3 size-5" />
          <p className="text-lg font-semibold">Submit Link</p>
          <p className="text-sm text-muted-foreground">
            Online sources by country and product type.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="ghost"
        className="w-fit px-2"
        onClick={() => setMode(null)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Card className="border-emerald-100 shadow-sm">
        <CardContent>
          {mode === "location" ? <LocationSubmissionForm /> : <LinkSubmissionForm />}
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="ghost"
        className="w-fit px-2"
        onClick={() => setMode(null)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
    </div>
  );
}
