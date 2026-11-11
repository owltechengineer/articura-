import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { PROJECTS } from "@/lib/projects";

const publicPaths = [
  "/",
  "/servizi",
  "/servizi/siti-web",
  "/servizi/software-personalizzato",
  "/servizi/digitalizzazione",
  "/servizi/automazioni-ai",
  "/settori",
  "/progetti",
  "/chi-siamo",
  "/contatti",
  "/richiedi-preventivo",
  "/privacy",
  "/cookie-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = publicPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const projectEntries = PROJECTS.map((project) => ({
    url: `${SITE_URL}/progetti/${project.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...projectEntries];
}
