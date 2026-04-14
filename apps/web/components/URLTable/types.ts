import type { RouterOutputs } from "../../utils/trpc";

export const SORT_FIELDS = [
  "lastUpdated",
  "citationsCount",
  "visibilityScore",
  "domainAuthority",
  "mentionsCount",
  "positionInResponse",
  "trafficEstimate",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField | undefined;
  direction: SortDirection;
}

export type UrlRow = RouterOutputs["urls"]["list"]["items"][number];
