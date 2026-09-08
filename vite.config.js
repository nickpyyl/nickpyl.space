import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sectionPaths } from "./src/routes.js";

// GitHub Pages needs a physical entry page for direct visits to each route.
function routePages() {
  return {
    name: "route-pages",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const html = bundle["index.html"].source;

        for (const path of Object.values(sectionPaths)) {
          if (path === "/") continue;

          this.emitFile({
            type: "asset",
            fileName: `${path.slice(1)}/index.html`,
            source: html.replace(
              'rel="canonical" href="https://nickpyl.space/"',
              `rel="canonical" href="https://nickpyl.space${path}"`,
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
