import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpsBrain Finance",
    short_name: "OpsBrain",
    description: "המערכת התפעולית הפיננסית של העסק שלך",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1117",
    theme_color: "#0F1117",
    orientation: "portrait-primary",
    dir: "rtl",
    lang: "he",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
