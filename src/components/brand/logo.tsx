import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Set to `null` to render without a link. Defaults to `/`. */
  href?: string | null;
  showWordmark?: boolean;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

const SIZES = {
  sm: { mark: 28, word: "text-sm" },
  md: { mark: 36, word: "text-sm" },
  lg: { mark: 48, word: "text-base" },
} as const;

export function BrandLogo({
  href = "/",
  showWordmark = true,
  variant = "dark",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const linkHref = href === null ? null : href;
  const dimensions = SIZES[size];
  const src =
    variant === "light"
      ? "/brand/articura-mark-light.png"
      : "/brand/articura-mark.png";

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={src}
        alt=""
        width={dimensions.mark}
        height={dimensions.mark}
        className="h-auto w-auto object-contain"
        style={{ width: dimensions.mark, height: dimensions.mark }}
        priority={priority}
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-[0.18em]",
            dimensions.word,
            variant === "light" ? "text-white" : "text-foreground",
          )}
        >
          {APP_NAME}
        </span>
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </span>
  );

  if (!linkHref) {
    return content;
  }

  return (
    <Link
      href={linkHref}
      className="inline-flex items-center"
      aria-label={APP_NAME}
    >
      {content}
    </Link>
  );
}
