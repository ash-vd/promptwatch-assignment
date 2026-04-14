type BadgeVariant = "success" | "warning" | "destructive" | "outline";

interface SentimentStyle {
  border: string;
  variant: BadgeVariant;
}

const SENTIMENT_STYLES: Record<string, SentimentStyle> = {
  positive: { border: "border-l-emerald-500", variant: "success" },
  neutral: { border: "border-l-amber-400", variant: "warning" },
  negative: { border: "border-l-red-500", variant: "destructive" },
  mixed: { border: "border-l-blue-500", variant: "outline" },
};

const DEFAULT_STYLE: SentimentStyle = {
  border: "border-l-gray-300",
  variant: "outline",
};

export const getSentimentStyle = (sentiment: string): SentimentStyle =>
  SENTIMENT_STYLES[sentiment.toLowerCase()] ?? DEFAULT_STYLE;
