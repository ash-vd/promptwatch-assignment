"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { useBrandColorSubscription } from "../hooks/useBrandColorSubscription";

function Subscriptions({ children }: { children: React.ReactNode }) {
  useBrandColorSubscription();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000 },
        },
      }),
  );

  const [trpcClient] = useState(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/trpc`;
    return trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({ url }),
          false: httpBatchLink({ url }),
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Subscriptions>{children}</Subscriptions>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
