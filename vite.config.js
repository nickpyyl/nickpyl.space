import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { DEFAULT_SECTION_ID, legacySectionPaths, sectionPaths, sectionTitles } from "./src/routes.js";

// GitHub Pages needs a physical entry page for direct visits to each route.
function routePages() {
  return {
    name: "route-pages",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const html = bundle["index.html"].source;
        bundle["index.html"].source = html.replace(
          "<title>Nick Pyl</title>",
          `<title>${sectionTitles[DEFAULT_SECTION_ID]}</title>`,
        );

        const entries = [
          ...Object.entries(sectionPaths),
          ...Object.entries(legacySectionPaths).map(([path, id]) => [id, path]),
        ];
        for (const [sectionId, path] of entries) {
          if (path === "/") continue;

          this.emitFile({
            type: "asset",
            fileName: `${path.slice(1)}/index.html`,
            source: html.replace(
              "<title>Nick Pyl</title>",
              `<title>${sectionTitles[sectionId]}</title>`,
            ).replace(
              'rel="canonical" href="https://nickpyl.space/"',
              `rel="canonical" href="https://nickpyl.space${sectionPaths[sectionId]}"`,
            ),
          });
        }
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), routePages()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});
