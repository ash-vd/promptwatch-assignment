import { ExternalLink } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatLabel, formatTraffic } from "../../lib/utils";
import type { UrlRow } from "./types";

interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
}

const DetailField = ({ label, children }: DetailFieldProps) => (
  <div>
    <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </dt>
    <dd className="mt-0.5 text-sm font-medium">{children}</dd>
  </div>
);

interface DetailPanelProps {
  row: UrlRow;
}

export const DetailPanel = ({ row }: DetailPanelProps) => (
  <div className="space-y-4 py-3">
    <DetailField label="URL">
      <a
        href={row.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 break-all text-primary underline-offset-2 hover:underline"
      >
        {row.url}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </DetailField>

    <div className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
      <DetailField label="Competitor">
        {row.competitorMentioned || "—"}
      </DetailField>

      <DetailField label="Category">
        {formatLabel(row.queryCategory)}
      </DetailField>

      <DetailField label="Region">
        <Badge variant="outline" className="text-xs font-normal">
          {formatLabel(row.geographicRegion)}
        </Badge>
      </DetailField>

      <DetailField label="Traffic">
        {formatTraffic(row.trafficEstimate)}
      </DetailField>

      <DetailField label="Mentions">{row.mentionsCount}</DetailField>

      <DetailField label="Position in Response">
        #{row.positionInResponse}
      </DetailField>

      <DetailField label="Response Type">
        {formatLabel(row.responseType)}
      </DetailField>
    </div>
  </div>
);
