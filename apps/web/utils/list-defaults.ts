import type { RouterInputs } from "./trpc";

export const PAGE_SIZE = 20;

export const DEFAULT_LIST_INPUT: RouterInputs["urls"]["list"] = {
  page: 1,
  pageSize: PAGE_SIZE,
  sortField: undefined,
  sortDirection: "desc",
  filterAiModel: undefined,
  filterSentiment: undefined,
  filterRegion: undefined,
  filterCategory: undefined,
  search: undefined,
};
