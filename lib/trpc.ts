import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers/_app";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  return `http://localhost:3000`;
}

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    };
  },
  ssr: false,
});
