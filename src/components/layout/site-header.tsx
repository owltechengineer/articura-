"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo href="/" size="sm" priority />

        <nav className="hidden items-center gap-8 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Accedi</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/richiedi-preventivo">Parliamo del tuo progetto</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-background-secondary hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/richiedi-preventivo"
            className="mt-2 rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Parliamo del tuo progetto
          </Link>
        </nav>
      </div>
    </header>
  );
}
