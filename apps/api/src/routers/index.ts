import type {} from "@trpc/server/unstable-core-do-not-import";
import { router } from "../trpc";
import { urlsRouter } from "./urls";
import { eventsRouter } from "./events";

export const appRouter = router({
  urls: urlsRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
