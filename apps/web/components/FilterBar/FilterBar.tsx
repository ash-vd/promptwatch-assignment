"use client";

import { X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { formatLabel } from "../../lib/utils";
import { FilterSelect } from "./FilterSelect";
import type { Filters, FilterOptions } from "./types";

interface FilterBarProps {
  filters: Filters;
  options: FilterOptions | undefined;
  hasActiveFilters: boolean;
  onChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

export const FilterBar = ({
  filters,
  options,
  hasActiveFilters,
  onChange,
  onReset,
}: FilterBarProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      placeholder="Search URL or title…"
      className="h-9 w-56"
      value={filters.search}
      onChange={(e) => onChange("search", e.target.value)}
      aria-label="Search URLs or titles"
    />

    <FilterSelect
      value={filters.aiModel}
      options={options?.aiModels}
      allLabel="All models"
      placeholder="AI Model"
      triggerClassName="h-9 w-40"
      onChange={(v) => onChange("aiModel", v)}
    />

    <FilterSelect
      value={filters.sentiment}
      options={options?.sentiments}
      allLabel="All sentiment"
      placeholder="Sentiment"
      triggerClassName="h-9 w-36"
      formatOption={formatLabel}
      onChange={(v) => onChange("sentiment", v)}
    />

    <FilterSelect
      value={filters.region}
      options={options?.regions}
      allLabel="All regions"
      placeholder="Region"
      triggerClassName="h-9 w-40"
      formatOption={formatLabel}
      onChange={(v) => onChange("region", v)}
    />

    <FilterSelect
      value={filters.category}
      options={options?.categories}
      allLabel="All categories"
      placeholder="Category"
      triggerClassName="h-9 w-44"
      formatOption={formatLabel}
      onChange={(v) => onChange("category", v)}
    />

    {hasActiveFilters && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="h-9 gap-1 text-muted-foreground"
      >
        <X className="h-3.5 w-3.5" />
        Reset
      </Button>
    )}
  </div>
);
