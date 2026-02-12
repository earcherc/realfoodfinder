import { MapPinPlus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocationSubmissionForm } from "@/components/location-submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Submit a location
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Share farms, homes, stores, and drop points to help people source real
            food nearby. Submissions are reviewed before publishing to the map.
          </p>
        </section>

        <Card className="border-emerald-100 shadow-sm">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <MapPinPlus className="size-4 text-emerald-700" />
              Location details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSubmissionForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
