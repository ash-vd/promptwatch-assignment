import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import { getQueryKey } from "@trpc/react-query";
import type { AppRouter } from "@repo/api/src";
import { trpc, type RouterInputs } from "./trpc";
import { DEFAULT_LIST_INPUT } from "./list-defaults";

const getApiUrl = () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set for server-side tRPC calls",
    );
  }

  return process.env.NEXT_PUBLIC_API_URL;
};

export type ServerTrpcContext = {
  queryClient: QueryClient;
  client: ReturnType<typeof createTRPCClient<AppRouter>>;
};

export const createServerTrpc = (): ServerTrpcContext => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 },
    },
  });

  const client = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${getApiUrl()}/trpc`,
        fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
      }),
    ],
  });

  return { queryClient, client };
};

export const prefetchSummary = (ctx: ServerTrpcContext) =>
  ctx.queryClient.prefetchQuery({
    queryKey: getQueryKey(trpc.urls.summary, undefined, "query"),
    queryFn: () => ctx.client.urls.summary.query(),
  });

export const prefetchStats = (ctx: ServerTrpcContext) =>
  ctx.queryClient.prefetchQuery({
    queryKey: getQueryKey(trpc.urls.stats, undefined, "query"),
    queryFn: () => ctx.client.urls.stats.query(),
  });

export const prefetchFilterOptions = (ctx: ServerTrpcContext) =>
  ctx.queryClient.prefetchQuery({
    queryKey: getQueryKey(trpc.urls.filterOptions, undefined, "query"),
    queryFn: () => ctx.client.urls.filterOptions.query(),
  });

export const prefetchList = (
  ctx: ServerTrpcContext,
  input: RouterInputs["urls"]["list"] = DEFAULT_LIST_INPUT,
) =>
  ctx.queryClient.prefetchQuery({
    queryKey: getQueryKey(trpc.urls.list, input, "query"),
    queryFn: () => ctx.client.urls.list.query(input),
  });
