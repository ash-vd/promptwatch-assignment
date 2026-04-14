"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { useURLTable } from "../../hooks/useURLTable";

import { FilterBar } from "../FilterBar";
import { Pagination } from "../Pagination";
import { ExportButton } from "./ExportButton";
import { SortableHead } from "./SortableHead";
import { UrlTableRow } from "./URLTableRow";

const COLUMNS = [
  "expand",
  "site",
  "model",
  "sentiment",
  "citations",
  "visibility",
  "authority",
  "updated",
] as const;

const COL_COUNT = COLUMNS.length;

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {COLUMNS.map((col) => (
        <TableCell key={col}>
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  ));

const EmptyRow = () => (
  <TableRow>
    <TableCell
      colSpan={COL_COUNT}
      className="py-16 text-center text-muted-foreground"
    >
      No data found. Upload a CSV file to get started.
    </TableCell>
  </TableRow>
);

const ErrorRow = () => (
  <TableRow>
    <TableCell
      colSpan={COL_COUNT}
      className="py-16 text-center text-destructive"
    >
      Couldn&apos;t load URL entries. Please try again.
    </TableCell>
  </TableRow>
);

export const URLTable = () => {
  const {
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
  } = useURLTable();

  const canExport = !isLoading && (data?.total ?? 0) > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>
          URL Entries{" "}
          {data && (
            <span className="font-normal text-muted-foreground">
              ({data.total.toLocaleString()})
            </span>
          )}
        </CardTitle>
        <ExportButton
          queryInput={{
            filterAiModel: queryInput.filterAiModel,
            filterSentiment: queryInput.filterSentiment,
            filterRegion: queryInput.filterRegion,
            filterCategory: queryInput.filterCategory,
            search: queryInput.search,
          }}
          disabled={!canExport}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar
          filters={filters}
          options={filterOptions}
          hasActiveFilters={hasActiveFilters}
          onChange={updateFilter}
          onReset={resetFilters}
        />

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10" />
                <TableHead className="min-w-70">Site</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Sentiment</TableHead>
                <SortableHead
                  field="citationsCount"
                  label="Citations"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  field="visibilityScore"
                  label="Visibility"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  field="domainAuthority"
                  label="Authority"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  field="lastUpdated"
                  label="Updated"
                  sort={sort}
                  onSort={toggleSort}
                />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isError ? (
                <ErrorRow />
              ) : isLoading ? (
                <SkeletonRows />
              ) : data?.items.length === 0 ? (
                <EmptyRow />
              ) : (
                data?.items.map((row) => (
                  <UrlTableRow
                    key={row.id}
                    row={row}
                    isExpanded={expandedRows.has(row.id)}
                    onToggle={toggleRow}
                    detailColSpan={COL_COUNT - 1}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRows={data.total}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
};
