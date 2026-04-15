// src/env.ts
import path from "path";
var loadEnv = () => {
  try {
    process.loadEnvFile(path.join(import.meta.dirname, "../.env"));
  } catch {
  }
};

export {
  loadEnv
};
