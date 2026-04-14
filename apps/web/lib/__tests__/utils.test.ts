import { cn, formatLabel, formatTraffic, getHostname } from "../utils";

describe("cn()", () => {
  it("joins truthy class names and drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("deduplicates conflicting tailwind utilities, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("accepts arrays and conditional objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });
});

describe("formatLabel()", () => {
  it("capitalizes single-word strings", () => {
    expect(formatLabel("positive")).toBe("Positive");
  });

  it("splits snake_case and capitalizes each segment", () => {
    expect(formatLabel("query_category")).toBe("Query Category");
    expect(formatLabel("last_updated_at")).toBe("Last Updated At");
  });

  it("returns an empty string for an empty input", () => {
    expect(formatLabel("")).toBe("");
  });

  it("leaves already-capitalized segments untouched", () => {
    expect(formatLabel("API_key")).toBe("API Key");
  });
});

describe("getHostname()", () => {
  it("returns the hostname of a valid URL", () => {
    expect(getHostname("https://example.com/some/path")).toBe("example.com");
  });

  it("strips the leading 'www.' prefix", () => {
    expect(getHostname("https://www.example.com")).toBe("example.com");
  });

  it("only strips a leading 'www.', not embedded occurrences", () => {
    expect(getHostname("https://wwwbeta.example.com")).toBe(
      "wwwbeta.example.com",
    );
  });

  it("preserves subdomains other than www", () => {
    expect(getHostname("https://blog.example.com/post")).toBe(
      "blog.example.com",
    );
  });

  it("returns the original string for invalid URLs", () => {
    expect(getHostname("not a url")).toBe("not a url");
    expect(getHostname("")).toBe("");
  });
});

describe("formatTraffic()", () => {
  it("returns an em-dash for non-finite values", () => {
    expect(formatTraffic(NaN)).toBe("-");
    expect(formatTraffic(Infinity)).toBe("-");
    expect(formatTraffic(-Infinity)).toBe("-");
  });

  it("locale-formats values below 1,000", () => {
    expect(formatTraffic(0)).toBe("0");
    expect(formatTraffic(42)).toBe("42");
    expect(formatTraffic(999)).toBe("999");
  });

  it("abbreviates thousands with a 'K' suffix, rounded", () => {
    expect(formatTraffic(1_000)).toBe("1K");
    expect(formatTraffic(1_499)).toBe("1K");
    expect(formatTraffic(1_500)).toBe("2K");
    expect(formatTraffic(999_499)).toBe("999K");
  });

  it("abbreviates millions with an 'M' suffix, one decimal", () => {
    expect(formatTraffic(1_000_000)).toBe("1.0M");
    expect(formatTraffic(1_250_000)).toBe("1.3M");
    expect(formatTraffic(12_500_000)).toBe("12.5M");
  });
});
