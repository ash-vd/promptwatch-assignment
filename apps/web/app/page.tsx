"use client";

import { trpc } from "../utils/trpc";
import { CsvUpload } from "../components/CsvUpload";
import { URLChart } from "../components/URLChart";
import { URLTable } from "../components/URLTable";
import { SummaryCards } from "../components/SummaryCards";

export default function HomePage() {
  const utils = trpc.useUtils();

  const handleUploadSuccess = () => {
    void utils.urls.list.invalidate();
    void utils.urls.stats.invalidate();
    void utils.urls.summary.invalidate();
    void utils.urls.filterOptions.invalidate();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">PromptWatch</h1>
          <p className="text-sm text-muted-foreground">
            Upload a CSV of URL mentions to explore visibility across AI search
            engines.
          </p>
        </header>

        <CsvUpload onSuccess={handleUploadSuccess} />
        <SummaryCards />
        <URLChart />
        <URLTable />
      </main>
    </div>
  );
}
