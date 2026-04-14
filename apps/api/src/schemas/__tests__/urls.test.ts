import {
  csvRowSchema,
  exportInputSchema,
  listInputSchema,
  uploadInputSchema,
} from "../urls";

const validCsvRow = {
  url: "https://example.com/path",
  title: "Example page",
  ai_model_mentioned: "gpt-4",
  citations_count: "5",
  sentiment: "positive",
  visibility_score: "80",
  competitor_mentioned: "",
  query_category: "marketing",
  last_updated: "2026-01-15",
  traffic_estimate: "1000",
  domain_authority: "75",
  mentions_count: "3",
  position_in_response: "1",
  response_type: "citation",
  geographic_region: "US",
};

describe("csvRowSchema", () => {
  it("parses a valid CSV row and coerces numeric/date fields", () => {
    const result = csvRowSchema.parse(validCsvRow);

    expect(result.citations_count).toBe(5);
    expect(result.visibility_score).toBe(80);
    expect(result.last_updated).toBeInstanceOf(Date);
    expect(result.sentiment).toBe("positive");
  });

  it("rejects invalid URLs", () => {
    const result = csvRowSchema.safeParse({ ...validCsvRow, url: "not-a-url" });

    expect(result.success).toBe(false);
  });

  it("rejects sentiment values outside the allowed enum", () => {
    const result = csvRowSchema.safeParse({
      ...validCsvRow,
      sentiment: "mixed",
    });

    expect(result.success).toBe(false);
  });

  it("rejects visibility scores above 100", () => {
    const result = csvRowSchema.safeParse({
      ...validCsvRow,
      visibility_score: "150",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative citation counts", () => {
    const result = csvRowSchema.safeParse({
      ...validCsvRow,
      citations_count: "-1",
    });

    expect(result.success).toBe(false);
  });

  it("allows empty competitor_mentioned but requires non-empty title", () => {
    const ok = csvRowSchema.safeParse({
      ...validCsvRow,
      competitor_mentioned: "",
    });

    expect(ok.success).toBe(true);

    const bad = csvRowSchema.safeParse({ ...validCsvRow, title: "" });
    expect(bad.success).toBe(false);
  });
});

describe("listInputSchema", () => {
  it("applies defaults when only required-ish fields are omitted", () => {
    const result = listInputSchema.parse({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.sortDirection).toBe("desc");
    expect(result.sortField).toBeUndefined();
  });

  it("rejects pageSize above the maximum", () => {
    const result = listInputSchema.safeParse({ pageSize: 500 });

    expect(result.success).toBe(false);
  });

  it("rejects unknown sort fields", () => {
    const result = listInputSchema.safeParse({ sortField: "nope" });

    expect(result.success).toBe(false);
  });

  it("rejects searches longer than 200 chars", () => {
    const result = listInputSchema.safeParse({ search: "x".repeat(201) });

    expect(result.success).toBe(false);
  });

  it("accepts a fully-specified filtered query", () => {
    const result = listInputSchema.parse({
      page: 2,
      pageSize: 50,
      sortField: "citationsCount",
      sortDirection: "asc",
      filterAiModel: "gpt-4",
      filterSentiment: "positive",
      filterRegion: "US",
      filterCategory: "marketing",
      search: "example",
    });

    expect(result.page).toBe(2);
    expect(result.filterSentiment).toBe("positive");
  });
});

describe("exportInputSchema", () => {
  it("accepts an empty input", () => {
    expect(exportInputSchema.parse({})).toEqual({});
  });

  it("validates the sentiment enum when provided", () => {
    const result = exportInputSchema.safeParse({ filterSentiment: "medium" });

    expect(result.success).toBe(false);
  });
});

describe("uploadInputSchema", () => {
  it("requires non-empty csvContent", () => {
    const empty = uploadInputSchema.safeParse({ csvContent: "" });
    expect(empty.success).toBe(false);

    const ok = uploadInputSchema.safeParse({ csvContent: "url,title\n..." });
    expect(ok.success).toBe(true);
  });
});
