import { afterEach, vi } from "vitest";

export const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

export const mockOpenRouterResponse = (content: string | null, ok = true) => ({
  ok,
  json: async () => ({
    choices: content === null ? [] : [{ message: { content } }],
  }),
});
