"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Button } from "@/components/ui/button";

function isCurrent(pathname: string, target: string) {
  return pathname === target;
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-emerald-100/70 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
        >
          <Leaf className="size-4 text-emerald-700" />
          Real Food Finder
        </Link>
        <nav className="flex flex-nowrap items-center gap-2">
          <Button
            size="sm"
            variant={isCurrent(pathname, "/") ? "secondary" : "ghost"}
            asChild
          >
            <Link href="/">Map</Link>
          </Button>
          <Button
            size="sm"
            variant={isCurrent(pathname, "/locations") ? "secondary" : "ghost"}
            asChild
          >
            <Link href="/locations">Locations</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/submit">
              <span className="sm:hidden">Submit</span>
              <span className="hidden sm:inline">Submit Location</span>
            </Link>
          </Button>
          <FeedbackDialog />
        </nav>
      </div>
    </header>
  );
}
