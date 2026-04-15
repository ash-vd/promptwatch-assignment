import { loadEnv } from "./src/env";
import { defineConfig, env } from "prisma/config";

loadEnv();

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
