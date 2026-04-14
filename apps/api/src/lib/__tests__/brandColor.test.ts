import { prismaMock } from "../../__mocks__/prisma";
import { fetchMock, mockOpenRouterResponse } from "../../__mocks__/fetch";
import { getBrandColors } from "../brandColor";

describe("getBrandColors()", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubEnv("OPENROUTER_MODEL", "test-model");
    prismaMock.domainColor.findMany.mockResolvedValue([]);
    prismaMock.domainColor.createMany.mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns an empty map when no domains are provided", async () => {
    const result = await getBrandColors([], prismaMock);

    expect(result.size).toBe(0);
    expect(prismaMock.domainColor.findMany).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns cached colors without fetching when every domain is cached", async () => {
    prismaMock.domainColor.findMany.mockResolvedValue([
      { domain: "example.com", color: "#ff0000" },
      { domain: "other.com", color: "#00ff00" },
    ] as never);

    const result = await getBrandColors(
      ["example.com", "other.com"],
      prismaMock,
    );

    expect(result.get("example.com")).toBe("#ff0000");
    expect(result.get("other.com")).toBe("#00ff00");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.domainColor.createMany).not.toHaveBeenCalled();
  });

  it("fetches missing domains, persists them, and merges with cache", async () => {
    prismaMock.domainColor.findMany.mockResolvedValue([
      { domain: "cached.com", color: "#aaaaaa" },
    ] as never);
    fetchMock.mockResolvedValueOnce(
      mockOpenRouterResponse("The color is #123456."),
    );

    const result = await getBrandColors(
      ["cached.com", "fresh.com"],
      prismaMock,
    );

    expect(result.get("cached.com")).toBe("#aaaaaa");
    expect(result.get("fresh.com")).toBe("#123456");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(prismaMock.domainColor.createMany).toHaveBeenCalledWith({
      data: [{ domain: "fresh.com", color: "#123456" }],
      skipDuplicates: true,
    });
  });

  it("omits domains whose fetch response has no hex code", async () => {
    fetchMock.mockResolvedValueOnce(mockOpenRouterResponse("I don't know"));

    const result = await getBrandColors(["mystery.com"], prismaMock);

    expect(result.has("mystery.com")).toBe(false);
    expect(prismaMock.domainColor.createMany).not.toHaveBeenCalled();
  });

  it("returns null for a failed OpenRouter response without throwing", async () => {
    fetchMock.mockResolvedValueOnce(mockOpenRouterResponse(null, false));

    const result = await getBrandColors(["broken.com"], prismaMock);

    expect(result.has("broken.com")).toBe(false);
    expect(prismaMock.domainColor.createMany).not.toHaveBeenCalled();
  });

  it("swallows fetch errors and skips the domain", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const result = await getBrandColors(["flaky.com"], prismaMock);

    expect(result.has("flaky.com")).toBe(false);
    expect(prismaMock.domainColor.createMany).not.toHaveBeenCalled();
  });

  it("skips OpenRouter lookups when OPENROUTER_API_KEY is not set", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");

    const result = await getBrandColors(["any.com"], prismaMock);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
    expect(prismaMock.domainColor.createMany).not.toHaveBeenCalled();
  });

  it("normalizes uppercase hex values to lowercase", async () => {
    fetchMock.mockResolvedValueOnce(mockOpenRouterResponse("#AABBCC"));

    const result = await getBrandColors(["caps.com"], prismaMock);

    expect(result.get("caps.com")).toBe("#aabbcc");
  });
});
