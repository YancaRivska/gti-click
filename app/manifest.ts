import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GTI CLICK",
    short_name: "GTI CLICK",
    description: "A galera registra. O GTI guarda.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05060B",
    theme_color: "#24103F",
    lang: "pt-BR",
    orientation: "portrait-primary",
  };
}
