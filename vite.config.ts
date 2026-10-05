// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves a project repo under /<repo>/, so assets and router URLs
// need that prefix. Set PAGES_BASE in the deploy workflow; local dev and any
// root-served host stay at "/".
const base = process.env["PAGES_BASE"] ?? "/";

export default defineConfig({
  vite: { base },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // GitHub Pages can only serve files, never run the SSR worker, so every
    // route is crawled and written out as static HTML into .output/public.
    prerender: { enabled: true, crawlLinks: true },
    // Emits an SPA shell, which doubles as the 404 fallback so client-side
    // routes still resolve on a deep link or refresh.
    spa: { enabled: true },
  },
});
