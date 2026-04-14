import { useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import type { Filters } from "../components/FilterBar";
import type {
  SortDirection,
  SortField,
  SortState,
} from "../components/URLTable/types";
import { useDebouncedValue } from "./useDebouncedValue";

const PAGE_SIZE = 20;

const EMPTY_FILTERS: Filters = {
  aiModel: "",
  sentiment: "",
  region: "",
  category: "",
  search: "",
};

export const useURLTable = () => {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const debouncedSearch = useDebouncedValue(filters.search, 250);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1);
  };

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== ""),
    [filters],
  );

  const queryInput = {
    filterAiModel: filters.aiModel || undefined,
    filterSentiment: (filters.sentiment || undefined) as
      | "positive"
      | "negative"
      | "neutral"
      | undefined,
    filterRegion: filters.region || undefined,
    filterCategory: filters.category || undefined,
    search: debouncedSearch || undefined,
  };

  const { data: filterOptions } = trpc.urls.filterOptions.useQuery();
  const { data, isLoading, isError } = trpc.urls.list.useQuery({
    page,
    pageSize: PAGE_SIZE,
    sortField,
    sortDirection,
    ...queryInput,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const sort: SortState = { field: sortField, direction: sortDirection };

  return {
    data,
    filterOptions,
    isLoading,
    isError,
    totalPages,
    page,
    setPage,
    sort,
    toggleSort,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    expandedRows,
    toggleRow,
    queryInput,
  };
};
