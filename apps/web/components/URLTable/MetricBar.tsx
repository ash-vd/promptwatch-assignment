interface MetricBarProps {
  value: number;
  max?: number;
}

export const MetricBar = ({ value, max = 100 }: MetricBarProps) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-right text-sm font-semibold tabular-nums">
        {value}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/60"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
