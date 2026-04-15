import type { PrismaClient } from "@repo/database";
import { emitBrandColorsUpdated } from "./events";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const HEX_REGEX = /#[0-9a-f]{6}/i;

const pendingRequests = new Map<string, Promise<string | null>>();

const askOpenRouter = async (domain: string): Promise<string | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    throw new Error("Environment variable OPENROUTER_API_KEY is required");

  const model = process.env.OPENROUTER_MODEL;

  if (!model)
    throw new Error("Environment variable OPENROUTER_MODEL is required");

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: `What is the primary brand color of the website ${domain}? Respond with only a single 6-digit hex color code starting with #, nothing else.`,
          },
        ],
      }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const match = content.match(HEX_REGEX);

    return match ? match[0].toLowerCase() : null;
  } catch {
    return null;
  }
};

const lookup = (domain: string): Promise<string | null> => {
  const existing = pendingRequests.get(domain);
  if (existing) return existing;

  const promise = askOpenRouter(domain).finally(() => {
    pendingRequests.delete(domain);
  });

  pendingRequests.set(domain, promise);

  return promise;
};

export const getBrandColors = async (
  domains: string[],
  prisma: PrismaClient,
): Promise<Map<string, string>> => {
  const result = new Map<string, string>();

  if (domains.length === 0) return result;

  const cached = await prisma.domainColor.findMany({
    where: { domain: { in: domains } },
  });

  for (const row of cached) {
    result.set(row.domain, row.color);
  }

  const missing = domains.filter((d) => !result.has(d));
  if (missing.length === 0) return result;

  const fetched = await Promise.all(
    missing.map(async (domain) => ({ domain, color: await lookup(domain) })),
  );

  const brandColors = fetched.filter(
    (entry): entry is { domain: string; color: string } => entry.color !== null,
  );

  if (brandColors.length > 0) {
    await prisma.domainColor.createMany({
      data: brandColors,
      skipDuplicates: true,
    });

    for (const { domain, color } of brandColors) {
      result.set(domain, color);
    }

    emitBrandColorsUpdated(brandColors.map((b) => b.domain));
  }

  return result;
};
