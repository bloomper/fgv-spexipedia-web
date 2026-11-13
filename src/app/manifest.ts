import type { MetadataRoute } from "next";

/**
 * Makes Spexipedia installable on phones and tablets, so it opens like an app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spexipedia",
    short_name: "Spexipedia",
    description: "Chalmersspexets uppslagsverk",
    start_url: "/",
    display: "standalone",
    background_color: "#14110f",
    theme_color: "#c9a55c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
