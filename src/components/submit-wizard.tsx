"use client";

import { useState } from "react";
import { Link as LinkIcon, MapPinPlus } from "lucide-react";
import { LinkSubmissionForm } from "@/components/link-submission-form";
import { LocationSubmissionForm } from "@/components/location-submission-form";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SubmitMode = "location" | "link";

export function SubmitWizard() {
  const [mode, setMode] = useState<SubmitMode>("location");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode("location")}
          className={cn(
            "min-h-36 rounded-xl border bg-background p-5 text-left transition hover:bg-muted",
            mode === "location" && "border-foreground bg-foreground text-background",
          )}
        >
          <MapPinPlus className="mb-3 size-5" />
          <p className="text-lg font-semibold">Submit Location</p>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              mode === "location" && "text-background/80",
            )}
          >
            Farms, stores, homes, and drop points.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "min-h-36 rounded-xl border bg-background p-5 text-left transition hover:bg-muted",
            mode === "link" && "border-foreground bg-foreground text-background",
          )}
        >
          <LinkIcon className="mb-3 size-5" />
          <p className="text-lg font-semibold">Submit Link</p>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              mode === "link" && "text-background/80",
            )}
          >
            Online sources by country and product type.
          </p>
        </button>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardContent>
          {mode === "location" ? <LocationSubmissionForm /> : <LinkSubmissionForm />}
        </CardContent>
      </Card>
    </div>
  );
}
