"use client";

import { useRef } from "react";
import { trpc } from "../utils/trpc";

const THROTTLE_MS = 1000;

export const useBrandColorSubscription = () => {
  const utils = trpc.useUtils();
  const lastRunAtRef = useRef(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  trpc.events.onBrandColorsUpdated.useSubscription(
    { lastEventId: null },
    {
      onData: () => {
        const now = Date.now();
        const elapsed = now - lastRunAtRef.current;

        if (elapsed >= THROTTLE_MS) {
          lastRunAtRef.current = now;
          void utils.urls.stats.invalidate();
          return;
        }

        if (pendingTimerRef.current) return;

        pendingTimerRef.current = setTimeout(() => {
          pendingTimerRef.current = null;
          lastRunAtRef.current = Date.now();

          void utils.urls.stats.invalidate();
        }, THROTTLE_MS - elapsed);
      },
      onError: (err) => {
        console.warn("[brandColor subscription]", err);
      },
    },
  );
};
