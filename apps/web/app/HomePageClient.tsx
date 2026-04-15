"use client";

import { CsvUpload } from "../components/CsvUpload";
import { URLChart } from "../components/URLChart";
import { URLTable } from "../components/URLTable";
import { SummaryCards } from "../components/SummaryCards";

export function HomePageClient() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <CsvUpload />
        <SummaryCards />
        <URLChart />
        <URLTable />
      </main>
    </div>
  );
}
