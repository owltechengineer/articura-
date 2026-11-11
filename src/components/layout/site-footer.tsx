import Link from "next/link";

import { BrandLogo } from "@/components/brand/logo";
import { APP_NAME, PUBLIC_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo href="/" size="sm" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-muted">
            Partner tecnologico delle microimprese artigiane e industriali.
            Software, siti e digitalizzazione con il miglior rapporto tra costo,
            valore e risultato.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Navigazione</p>
          <ul className="mt-3 space-y-2">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium">Legale</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/cookie-policy"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Cookie policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-foreground-muted sm:px-6">
          <span>© 2026 {APP_NAME}</span>
          <span>Italia · Lombardia</span>
        </div>
      </div>
    </footer>
  );
}
