"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "../utils/trpc";
import { useAnimatedProgress } from "../hooks/useAnimatedProgress";
import { readFileWithProgress } from "../lib/readFileWithProgress";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "../lib/utils";

type UploadState = "idle" | "reading" | "uploading" | "success" | "error";

type UploadResult = {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

interface CsvUploadProps {
  onSuccess: () => void;
}

// Reading = 0-50% (real), Uploading = 50-95% (animated), Done = 100%
const PHASE_READ_END = 50;
const PHASE_UPLOAD_END = 95;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const CsvUpload = ({ onSuccess }: CsvUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [readProgress, setReadProgress] = useState(0);
  const [message, setMessage] = useState<string | undefined>();
  const [result, setResult] = useState<UploadResult | undefined>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isUploading = state === "uploading";
  const animatedUpload = useAnimatedProgress(
    isUploading,
    PHASE_READ_END,
    PHASE_UPLOAD_END,
  );

  const progress =
    state === "reading"
      ? Math.round((readProgress / 100) * PHASE_READ_END)
      : state === "uploading"
        ? animatedUpload
        : state === "success"
          ? 100
          : 0;

  const upload = trpc.urls.upload.useMutation({
    onSuccess: (data) => {
      setState("success");
      setResult(data);
      setMessage(undefined);
      onSuccess();
    },
    onError: (err) => {
      setState("error");
      setResult(undefined);
      setMessage(err.message);
    },
  });

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setState("error");
        setMessage("Please upload a file with a .csv extension");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setState("error");
        setMessage("File size must be less than 10MB");
        return;
      }

      try {
        setState("reading");
        setReadProgress(0);
        const content = await readFileWithProgress(file, setReadProgress);

        if (!content.trim()) {
          setState("error");
          setMessage("The file is empty");
          return;
        }

        setState("uploading");
        upload.mutate({ csvContent: content });
      } catch (err) {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Failed to read file");
      }
    },
    [upload],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setState("idle");
    setReadProgress(0);
    setMessage(undefined);
    setResult(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isLoading = state === "reading" || state === "uploading";

  const stateLabel =
    state === "reading"
      ? "Reading file…"
      : state === "uploading"
        ? "Importing…"
        : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import URL Data</CardTitle>
        <CardDescription>
          Upload a CSV file to replace the current dataset
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDraggingOver && "border-primary bg-primary/5",
            !isDraggingOver &&
              "border-border hover:border-primary/50 hover:bg-muted/30",
            isLoading && "pointer-events-none opacity-60",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={isLoading}
            aria-label="Upload CSV file"
          />

          {state === "idle" && (
            <>
              <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop your CSV file here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports .csv files up to 10MB
              </p>
            </>
          )}

          {isLoading && (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">
                {stateLabel} {progress}%
              </p>
              <div
                className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}

          {state === "success" && result && (
            <>
              <CheckCircle2 className="mb-3 h-10 w-10 text-green-600" />
              <p className="text-sm font-medium text-green-700">
                {result.imported.toLocaleString()} row
                {result.imported === 1 ? "" : "s"} imported
                {result.skipped > 0 &&
                  `, ${result.skipped.toLocaleString()} skipped`}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 max-w-md text-left text-xs text-muted-foreground">
                  {result.errors.map((e) => (
                    <li key={e.row}>
                      <span className="font-mono">row {e.row}</span>: {e.message}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleReset}
              >
                Upload another file
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
              <p className="max-w-md text-sm font-medium text-destructive">
                {message}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleReset}
              >
                Try again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
