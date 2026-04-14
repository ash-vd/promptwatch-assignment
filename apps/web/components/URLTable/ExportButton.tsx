import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "../ui/button";

import { trpc, type RouterInputs } from "../../utils/trpc";

interface ExportButtonProps {
  queryInput: RouterInputs["urls"]["export"];
  disabled?: boolean;
}

const triggerDownload = (csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `urls-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const ExportButton = ({ queryInput, disabled }: ExportButtonProps) => {
  const utils = trpc.useUtils();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await utils.urls.export.fetch(queryInput);
      if (res.count > 0) triggerDownload(res.csv);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
};
