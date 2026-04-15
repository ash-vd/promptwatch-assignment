import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createServerTrpc,
  prefetchFilterOptions,
  prefetchList,
  prefetchStats,
  prefetchSummary,
} from "../utils/trpc-server";
import { HomePageClient } from "./HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trpcCtx = createServerTrpc();

  await Promise.allSettled([
    prefetchSummary(trpcCtx),
    prefetchStats(trpcCtx),
    prefetchFilterOptions(trpcCtx),
    prefetchList(trpcCtx),
  ]);

  return (
    <HydrationBoundary state={dehydrate(trpcCtx.queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
