import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "single-page-fallback",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        // Old bookmarks on GitHub Pages return to the single portfolio page.
        this.emitFile({ type: "asset", fileName: "404.html", source: bundle["index.html"].source });
      },
    },
  }, {
    name: "production-privacy-policy",
    apply: "build",
    transformIndexHtml() {
      return [{ tag: "meta", attrs: {
        "http-equiv": "Content-Security-Policy",
        content: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'",
      }, injectTo: "head-prepend" }];
    },
  }],
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
