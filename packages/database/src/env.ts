import path from "node:path";

export const loadEnv = () => {
  try {
    process.loadEnvFile(path.join(import.meta.dirname, "../.env"));
  } catch {
    // .env isn't always present
  }
};
