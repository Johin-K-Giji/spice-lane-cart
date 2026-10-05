import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Vite derives BASE_URL from `base` in vite.config.ts, so the router stays
    // in step with wherever the site is mounted (/ locally, /spice-lane-cart/
    // on GitHub Pages).
    basepath: import.meta.env.BASE_URL,
  });

  return router;
};
