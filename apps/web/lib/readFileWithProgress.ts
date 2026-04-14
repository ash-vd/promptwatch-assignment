export const readFileWithProgress = (
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
