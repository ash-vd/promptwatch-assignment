"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FilterSelectProps {
  value: string;
  options: string[] | undefined;
  allLabel: string;
  triggerClassName?: string;
  placeholder: string;
  formatOption?: (value: string) => string;
  onChange: (value: string) => void;
}

export const FilterSelect = ({
  value,
  options,
  allLabel,
  triggerClassName,
  placeholder,
  formatOption = (v) => v,
  onChange,
}: FilterSelectProps) => (
  <Select
    value={value || "all"}
    onValueChange={(v) => onChange(v === "all" ? "" : v)}
  >
    <SelectTrigger className={triggerClassName ?? "h-9 w-40"}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{allLabel}</SelectItem>
      {options?.map((v) => (
        <SelectItem key={v} value={v}>
          {formatOption(v)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
