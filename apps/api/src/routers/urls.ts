import Papa from "papaparse";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import type { Context } from "../trpc";
import type { Prisma } from "@repo/database";
import {
  csvRowSchema,
  exportInputSchema,
  listInputSchema,
  REQUIRED_CSV_HEADERS,
  uploadInputSchema,
  type ExportInput,
  type ListInput,
} from "../schemas/urls";
import { getBrandColors } from "../lib/brandColor";

const TOP_DOMAINS_LIMIT = 15;
const MAX_ROW_ERRORS = 5;
const EXPORT_LIMIT = 10_000;

export const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const weekStartIso = (date: Date): string => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - offset);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0]!;
};

const topDomains = (urls: { url: string }[], limit: number): string[] => {
  const counts = new Map<string, number>();
  for (const { url } of urls) {
    const domain = getHostname(url);
    if (!domain) continue;
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain]) => domain);
};

const buildWhere = (
  input: Pick<
    ListInput,
    | "filterAiModel"
    | "filterSentiment"
    | "filterRegion"
    | "filterCategory"
    | "search"
  >,
): Prisma.UrlEntryWhereInput => ({
  ...(input.filterAiModel && { aiModelMentioned: input.filterAiModel }),
  ...(input.filterSentiment && { sentiment: input.filterSentiment }),
  ...(input.filterRegion && { geographicRegion: input.filterRegion }),
  ...(input.filterCategory && { queryCategory: input.filterCategory }),
  ...(input.search && {
    OR: [
      { url: { contains: input.search, mode: "insensitive" as const } },
      { title: { contains: input.search, mode: "insensitive" as const } },
    ],
  }),
});

export const urlsRouter = router({
  upload: publicProcedure
    .input(uploadInputSchema)
    .mutation(async ({ ctx, input }) => {
      const parsed = Papa.parse<Record<string, string>>(input.csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });

      if (parsed.errors.length > 0) {
        const first = parsed.errors[0]!;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `CSV parse error at row ${first.row ?? "?"}: ${first.message}`,
        });
      }

      const headers = parsed.meta.fields ?? [];
      const missing = REQUIRED_CSV_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `CSV is missing required columns: ${missing.join(", ")}`,
        });
      }

      if (parsed.data.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CSV contains no data rows",
        });
      }

      const validRows: Prisma.UrlEntryCreateManyInput[] = [];
      const errors: { row: number; message: string }[] = [];

      parsed.data.forEach((raw, i) => {
        const result = csvRowSchema.safeParse(raw);
        if (!result.success) {
          const issue = result.error.issues[0];
          errors.push({
            row: i + 2,
            message: issue
              ? `${issue.path.join(".") || "row"}: ${issue.message}`
              : "invalid row",
          });
          return;
        }
        const r = result.data;
        validRows.push({
          url: r.url,
          title: r.title,
          aiModelMentioned: r.ai_model_mentioned,
          citationsCount: r.citations_count,
          sentiment: r.sentiment,
          visibilityScore: r.visibility_score,
          competitorMentioned: r.competitor_mentioned,
          queryCategory: r.query_category,
          lastUpdated: r.last_updated,
          trafficEstimate: r.traffic_estimate,
          domainAuthority: r.domain_authority,
          mentionsCount: r.mentions_count,
          positionInResponse: r.position_in_response,
          responseType: r.response_type,
          geographicRegion: r.geographic_region,
        });
      });

      if (validRows.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No valid rows found. First error — row ${errors[0]?.row}: ${errors[0]?.message}`,
        });
      }

      const [, created] = await ctx.prisma.$transaction([
        ctx.prisma.urlEntry.deleteMany(),
        ctx.prisma.urlEntry.createMany({ data: validRows }),
      ]);

      // Fire-and-forget, getting the colors is non-blocking
      void getBrandColors(
        topDomains(validRows, TOP_DOMAINS_LIMIT),
        ctx.prisma,
      ).catch((err) => console.error("[brandColor] lookup failed", err));

      return {
        imported: created.count,
        skipped: errors.length,
        errors: errors.slice(0, MAX_ROW_ERRORS),
      };
    }),

  list: publicProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }: { ctx: Context; input: ListInput }) => {
      const where = buildWhere(input);
      const orderBy: Prisma.UrlEntryOrderByWithRelationInput = input.sortField
        ? { [input.sortField]: input.sortDirection }
        : { createdAt: "asc" };

      const [items, total] = await ctx.prisma.$transaction([
        ctx.prisma.urlEntry.findMany({
          where,
          orderBy,
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        ctx.prisma.urlEntry.count({ where }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  filterOptions: publicProcedure.query(async ({ ctx }) => {
    const [aiModels, sentiments, regions, categories] =
      await ctx.prisma.$transaction([
        ctx.prisma.urlEntry.groupBy({
          by: ["aiModelMentioned"],
          orderBy: { aiModelMentioned: "asc" },
        }),
        ctx.prisma.urlEntry.groupBy({
          by: ["sentiment"],
          orderBy: { sentiment: "asc" },
        }),
        ctx.prisma.urlEntry.groupBy({
          by: ["geographicRegion"],
          orderBy: { geographicRegion: "asc" },
        }),
        ctx.prisma.urlEntry.groupBy({
          by: ["queryCategory"],
          orderBy: { queryCategory: "asc" },
        }),
      ]);

    return {
      aiModels: aiModels.map((r) => r.aiModelMentioned),
      sentiments: sentiments.map((r) => r.sentiment),
      regions: regions.map((r) => r.geographicRegion),
      categories: categories.map((r) => r.queryCategory),
    };
  }),

  summary: publicProcedure.query(async ({ ctx }) => {
    const [total, domainRows, modelGroups] = await ctx.prisma.$transaction([
      ctx.prisma.urlEntry.count(),
      ctx.prisma.urlEntry.findMany({ select: { url: true } }),
      ctx.prisma.urlEntry.groupBy({
        by: ["aiModelMentioned"],
        _count: { _all: true },
        orderBy: { _count: { aiModelMentioned: "desc" } },
        take: 1,
      }),
    ]);

    const avg = await ctx.prisma.urlEntry.aggregate({
      _avg: { visibilityScore: true, domainAuthority: true },
    });

    const uniqueDomains = new Set(
      domainRows.map((r) => getHostname(r.url)).filter(Boolean),
    ).size;

    return {
      total,
      uniqueDomains,
      avgVisibility: Math.round(avg._avg.visibilityScore ?? 0),
      avgAuthority: Math.round(avg._avg.domainAuthority ?? 0),
    };
  }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const [allUrls, dateGroups] = await ctx.prisma.$transaction([
      ctx.prisma.urlEntry.findMany({ select: { url: true } }),
      ctx.prisma.urlEntry.groupBy({
        by: ["lastUpdated"],
        _count: { id: true },
        orderBy: { lastUpdated: "asc" },
      }),
    ]);

    const domainMap = new Map<string, number>();
    for (const { url } of allUrls) {
      const d = getHostname(url);
      if (!d) continue;
      domainMap.set(d, (domainMap.get(d) ?? 0) + 1);
    }

    const sortedDomains = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    const topDomainNames = sortedDomains
      .slice(0, TOP_DOMAINS_LIMIT)
      .map((d) => d.domain);

    const colorRows = topDomainNames.length
      ? await ctx.prisma.domainColor.findMany({
          where: { domain: { in: topDomainNames } },
        })
      : [];
    const colorByDomain = new Map(colorRows.map((r) => [r.domain, r.color]));

    const domainGroups = sortedDomains.map((d) => ({
      ...d,
      brandColor: colorByDomain.get(d.domain) ?? null,
    }));

    const weeklyMap = new Map<string, number>();
    for (const g of dateGroups) {
      const week = weekStartIso(g.lastUpdated);
      weeklyMap.set(week, (weeklyMap.get(week) ?? 0) + g._count.id);
    }
    const dateSeries = Array.from(weeklyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { domainGroups, dateSeries };
  }),

  export: publicProcedure
    .input(exportInputSchema)
    .query(async ({ ctx, input }: { ctx: Context; input: ExportInput }) => {
      const where = buildWhere(input);
      const rows = await ctx.prisma.urlEntry.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take: EXPORT_LIMIT,
      });

      const csv = Papa.unparse(
        rows.map((r) => ({
          url: r.url,
          title: r.title,
          ai_model_mentioned: r.aiModelMentioned,
          citations_count: r.citationsCount,
          sentiment: r.sentiment,
          visibility_score: r.visibilityScore,
          competitor_mentioned: r.competitorMentioned,
          query_category: r.queryCategory,
          last_updated: r.lastUpdated.toISOString().split("T")[0],
          traffic_estimate: r.trafficEstimate,
          domain_authority: r.domainAuthority,
          mentions_count: r.mentionsCount,
          position_in_response: r.positionInResponse,
          response_type: r.responseType,
          geographic_region: r.geographicRegion,
        })),
      );

      return { csv, count: rows.length };
    }),
});
