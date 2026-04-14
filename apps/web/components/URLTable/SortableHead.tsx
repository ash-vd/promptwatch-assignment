import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "../ui/table";
import type { SortField, SortState } from "./types";

interface SortIconProps {
  field: SortField;
  sort: SortState;
}

const SortIcon = ({ field, sort }: SortIconProps) => {
  if (sort.field !== field)
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  return sort.direction === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3" />
  );
};

interface SortableHeadProps {
  field: SortField;
  label: string;
  sort: SortState;
  onSort: (field: SortField) => void;
}

export const SortableHead = ({
  field,
  label,
  sort,
  onSort,
}: SortableHeadProps) => (
  <TableHead
    className="cursor-pointer select-none whitespace-nowrap"
    onClick={() => onSort(field)}
  >
    <span className="inline-flex items-center">
      {label}
      <SortIcon field={field} sort={sort} />
    </span>
  </TableHead>
);
