"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, BarChart3 } from "lucide-react";
import { trpc } from "../utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { formatDate, formatDateTooltipLabel } from "../lib/formatDate";

const CHART_COLOR = "var(--color-chart)";
const TOOLTIP_STYLE = {
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "12px",
};

const Skeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {[0, 1].map((i) => (
      <Card key={i}>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
}) => (
  <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
    <Icon className="h-10 w-10 text-muted-foreground/60" />
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

export const URLChart = () => {
  const { data: stats, isLoading, isError } = trpc.urls.stats.useQuery();

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="py-8">
              <EmptyState
                icon={AlertCircle}
                title="Couldn't load chart data"
                description="Check the API connection and try again."
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasData =
    stats &&
    (stats.domainGroups.length > 0 || stats.dateSeries.length > 0);

  const topDomains = (stats?.domainGroups ?? []).slice(0, 15).map((d) => ({
    ...d,
    fill: d.brandColor ?? CHART_COLOR,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Occurrences by Domain</CardTitle>
          <CardDescription>Top 15 websites by mention count</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData && topDomains.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topDomains}
                margin={{ top: 4, right: 8, left: -8, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="domain"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="Upload a CSV to see domain mentions."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Entries per week, by last_updated</CardDescription>
        </CardHeader>
        <CardContent>
          {hasData && (stats?.dateSeries.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={stats!.dateSeries}
                margin={{ top: 4, right: 8, left: -8, bottom: 4 }}
              >
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={formatDateTooltipLabel}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLOR}
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="Upload a CSV to see weekly activity."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
