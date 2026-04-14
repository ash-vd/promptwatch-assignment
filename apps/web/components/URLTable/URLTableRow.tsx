import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { TableCell, TableRow } from "../ui/table";
import { cn, formatLabel, getHostname } from "../../lib/utils";
import { MetricBar } from "./MetricBar";
import { DetailPanel } from "./DetailPanel";
import { getSentimentStyle } from "./sentiment";
import type { UrlRow } from "./types";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

interface UrlTableRowProps {
  row: UrlRow;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  detailColSpan: number;
}

export const UrlTableRow = ({
  row,
  isExpanded,
  onToggle,
  detailColSpan,
}: UrlTableRowProps) => {
  const sentiment = getSentimentStyle(row.sentiment);

  return (
    <Fragment>
      <TableRow
        className={cn(
          "group cursor-pointer transition-colors",
          isExpanded && "border-b-0 bg-muted/30",
        )}
        onClick={() => onToggle(row.id)}
      >
        <TableCell
          className={cn("w-10 border-l-4 pl-3 pr-0", sentiment.border)}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90",
            )}
          />
        </TableCell>

        <TableCell>
          <div className="min-w-0">
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {getHostname(row.url)}
            </a>
            <p className="text-xs text-muted-foreground">{row.title}</p>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="secondary" className="font-normal">
            {row.aiModelMentioned}
          </Badge>
        </TableCell>

        <TableCell>
          <Badge variant={sentiment.variant}>
            {formatLabel(row.sentiment)}
          </Badge>
        </TableCell>

        <TableCell className="text-right font-semibold tabular-nums">
          {row.citationsCount}
        </TableCell>

        <TableCell>
          <MetricBar value={row.visibilityScore} />
        </TableCell>

        <TableCell>
          <MetricBar value={row.domainAuthority} />
        </TableCell>

        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
          {new Date(row.lastUpdated).toLocaleDateString(
            "en-US",
            DATE_FORMAT_OPTIONS,
          )}
        </TableCell>
      </TableRow>

      <TableRow
        className={cn(
          "bg-muted/20 hover:bg-muted/20",
          !isExpanded && "border-b-0",
        )}
      >
        <TableCell className={cn("border-l-4 p-0", sentiment.border)} />
        <TableCell colSpan={detailColSpan} className="p-0">
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-out",
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="py-1">
                <DetailPanel row={row} />
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
