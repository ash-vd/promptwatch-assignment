import { router } from "../trpc";
import { urlsRouter } from "./urls";

export const appRouter = router({
  urls: urlsRouter,
});

export type AppRouter = typeof appRouter;
