"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate min-h-[min(100svh,820px)] overflow-hidden bg-[#0b1220] text-white">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.08 }}
        animate={reduce ? undefined : { scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/marketing/hero-articura.png"
          alt=""
          fill
          priority
          className="object-cover object-[72%_center]"
          sizes="100vw"
          aria-hidden
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,12,22,0.92)_0%,rgba(8,12,22,0.72)_42%,rgba(8,12,22,0.28)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(100svh,820px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:pb-24 lg:pt-24">
        <div className="max-w-2xl">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLogo
              href={null}
              size="lg"
              variant="light"
              className="mb-1 [&_span]:font-display [&_span]:text-2xl [&_span]:tracking-[0.22em] sm:[&_span]:text-3xl"
              priority
            />
            <p className="sr-only">{APP_NAME}</p>
          </motion.div>

          <motion.h1
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {APP_TAGLINE}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {APP_DESCRIPTION}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.34,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0b1220] hover:bg-white/90"
            >
              <Link href="/richiedi-preventivo">
                Parliamo del tuo progetto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/35 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/servizi">Scopri le nostre soluzioni</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[11px] uppercase tracking-[0.28em] text-white/45 md:block"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        aria-hidden
      >
        Scorri
      </motion.div>
    </section>
  );
}
