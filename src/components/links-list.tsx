"use client";

import { useMemo, useState } from "react";
import type { LinkRecord } from "@/lib/link-model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LinksListProps = {
  links: LinkRecord[];
};

export function LinksList({ links }: LinksListProps) {
  const [country, setCountry] = useState("all");

  const countries = useMemo(() => {
    return Array.from(new Set(links.map((link) => link.country))).sort();
  }, [links]);

  const filteredLinks = useMemo(() => {
    if (country === "all") {
      return links;
    }

    return links.filter((link) => link.country === country);
  }, [country, links]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Country filter
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCountry("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              country === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            All
          </button>
          {countries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCountry(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                country === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredLinks.map((link) => (
          <Card key={link.id} className="h-full gap-4">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {link.title}
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {link.description ? <p>{link.description}</p> : null}
              <p>Country: {link.country}</p>
              {link.products.length > 0 ? (
                <p>Products: {link.products.join(", ")}</p>
              ) : null}
              {link.tags.length > 0 ? <p>Tags: {link.tags.join(", ")}</p> : null}
              <div className="pt-1">
                <Badge variant="secondary">Online source</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
