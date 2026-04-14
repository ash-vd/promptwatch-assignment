import { z } from "zod";

export const sortFields = [
  "lastUpdated",
  "citationsCount",
  "visibilityScore",
  "domainAuthority",
  "mentionsCount",
  "positionInResponse",
  "trafficEstimate",
] as const;

export const sentimentValues = ["positive", "negative", "neutral"] as const;

export const REQUIRED_CSV_HEADERS = [
  "url",
  "title",
  "ai_model_mentioned",
  "citations_count",
  "sentiment",
  "visibility_score",
  "competitor_mentioned",
  "query_category",
  "last_updated",
  "traffic_estimate",
  "domain_authority",
  "mentions_count",
  "position_in_response",
  "response_type",
  "geographic_region",
] as const;

export const csvRowSchema = z.object({
  url: z.string().refine((value) => URL.canParse(value), {
    message: "must be a valid URL",
  }),
  title: z.string().min(1, "required"),
  ai_model_mentioned: z.string().min(1, "required"),
  citations_count: z.coerce.number().int().nonnegative(),
  sentiment: z.enum(sentimentValues),
  visibility_score: z.coerce.number().int().min(0).max(100),
  competitor_mentioned: z.string(),
  query_category: z.string().min(1, "required"),
  last_updated: z.coerce.date(),
  traffic_estimate: z.coerce.number().int().nonnegative(),
  domain_authority: z.coerce.number().int().min(0).max(100),
  mentions_count: z.coerce.number().int().nonnegative(),
  position_in_response: z.coerce.number().int().nonnegative(),
  response_type: z.string().min(1, "required"),
  geographic_region: z.string().min(1, "required"),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export const uploadInputSchema = z.object({
  csvContent: z.string().min(1),
});

const filterSchema = {
  filterAiModel: z.string().optional(),
  filterSentiment: z.enum(sentimentValues).optional(),
  filterRegion: z.string().optional(),
  filterCategory: z.string().optional(),
  search: z.string().max(200).optional(),
};

export const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortField: z.enum(sortFields).optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  ...filterSchema,
});

export type ListInput = z.infer<typeof listInputSchema>;

export const exportInputSchema = z.object(filterSchema);

export type ExportInput = z.infer<typeof exportInputSchema>;
