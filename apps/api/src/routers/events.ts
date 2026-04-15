import { on } from "node:events";
import { z } from "zod";
import { tracked } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import {
  appEvents,
  BRAND_COLORS_UPDATED,
  type BrandColorsUpdatedPayload,
} from "../lib/events";

let eventIdCounter = 0;

export const eventsRouter = router({
  onBrandColorsUpdated: publicProcedure
    .input(
      z.object({
        lastEventId: z.string().nullish(),
      }),
    )
    .subscription(async function* ({ signal }) {
      const iterable = on(appEvents, BRAND_COLORS_UPDATED, { signal });
      for await (const [payload] of iterable as AsyncIterable<
        [BrandColorsUpdatedPayload]
      >) {
        eventIdCounter += 1;
        yield tracked(String(eventIdCounter), payload);
      }
    }),
});
