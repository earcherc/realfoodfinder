import { SiteHeader } from "@/components/site-header";
import { SubmitWizard } from "@/components/submit-wizard";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <SubmitWizard />
      </main>
    </div>
  );
}
