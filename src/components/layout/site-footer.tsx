import Link from "next/link";

import { BrandLogo } from "@/components/brand/logo";
import { APP_NAME, PUBLIC_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#0b1220] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo href="/" size="sm" variant="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            Partner tecnologico delle microimprese artigiane e industriali.
            Software, siti e digitalizzazione con il miglior rapporto tra costo,
            valore e risultato.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-medium tracking-wide">
            Navigazione
          </p>
          <ul className="mt-3 space-y-2">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/65 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-medium tracking-wide">
            Legale
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/cookie-policy"
                className="text-sm text-white/65 transition-colors hover:text-white"
              >
                Cookie policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-white/45 sm:px-6">
          <span>© 2026 {APP_NAME}</span>
          <span>Italia · Lombardia</span>
        </div>
      </div>
    </footer>
  );
}
