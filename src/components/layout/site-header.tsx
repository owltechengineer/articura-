"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/80 bg-background/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo
          href="/"
          size="sm"
          priority
          variant={overHero ? "light" : "dark"}
          className={cn(
            overHero &&
              "[&_span]:text-white [&_span]:tracking-[0.2em]",
          )}
        />

        <nav className="hidden items-center gap-8 md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                overHero
                  ? "text-white/75 hover:text-white"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              overHero && "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <Link href="/login">Accedi</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className={cn(
              overHero && "bg-white text-[#0b1220] hover:bg-white/90",
            )}
          >
            <Link href="/richiedi-preventivo">Parliamo del tuo progetto</Link>
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden",
            overHero
              ? "border-white/30 text-white"
              : "border-border text-foreground",
          )}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t md:hidden",
          open ? "block" : "hidden",
          overHero
            ? "border-white/15 bg-[#0b1220]/95 backdrop-blur-md"
            : "border-border bg-background",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm",
                overHero
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-foreground-muted hover:bg-background-secondary hover:text-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/richiedi-preventivo"
            className={cn(
              "mt-2 rounded-md px-3 py-2 text-center text-sm font-medium",
              overHero
                ? "bg-white text-[#0b1220]"
                : "bg-accent text-accent-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            Parliamo del tuo progetto
          </Link>
        </nav>
      </div>
    </header>
  );
}
