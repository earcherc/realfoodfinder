import { SiteHeader } from "@/components/site-header";
import { LinksList } from "@/components/links-list";
import { listApprovedLinks } from "@/lib/link-repository";

export default async function LinksPage() {
  const links = await listApprovedLinks();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Approved Links</h1>
          <p className="text-sm text-muted-foreground">
            Online sources submitted by the community, filterable by country.
          </p>
        </section>

        <LinksList links={links} />
      </main>
    </div>
  );
}
