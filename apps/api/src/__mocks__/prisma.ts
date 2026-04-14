import { beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@repo/database";

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});
