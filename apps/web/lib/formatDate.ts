import type { ReactNode } from "react";

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const formatDateTooltipLabel = (label: ReactNode): string => {
  if (typeof label === "string") return formatDate(label);
  if (typeof label === "number") return formatDate(String(label));

  return "";
};
