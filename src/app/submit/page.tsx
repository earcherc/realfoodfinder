import { SiteHeader } from "@/components/site-header";
import { SubmitWizard } from "@/components/submit-wizard";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Submit
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Choose how you want to contribute: a physical location or an online link.
            Submissions are reviewed before publishing.
          </p>
        </section>

        <SubmitWizard />
      </main>
    </div>
  );
}
