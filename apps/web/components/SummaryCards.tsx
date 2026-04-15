"use client";

import { Database, Globe, Eye, Sparkles, type LucideIcon } from "lucide-react";
import { trpc } from "../utils/trpc";
import { Card, CardContent } from "./ui/card";

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  loading: boolean;
}

const Stat = ({ icon: Icon, label, value, loading }: StatProps) => (
  <Card>
    <CardContent className="flex items-center gap-4 py-5 h-full">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export const SummaryCards = () => {
  const { data, isLoading } = trpc.urls.summary.useQuery();

  if (!isLoading && (data?.total ?? 0) === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        icon={Database}
        label="Total entries"
        value={(data?.total ?? 0).toLocaleString()}
        loading={isLoading}
      />
      <Stat
        icon={Globe}
        label="Unique domains"
        value={(data?.uniqueDomains ?? 0).toLocaleString()}
        loading={isLoading}
      />
      <Stat
        icon={Eye}
        label="Avg visibility"
        value={`${data?.avgVisibility ?? 0}`}
        loading={isLoading}
      />
      <Stat
        icon={Sparkles}
        label="Avg domain authority"
        value={`${data?.avgAuthority ?? 0}`}
        loading={isLoading}
      />
    </div>
  );
};
