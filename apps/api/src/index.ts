import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import cors from "@fastify/cors";
import { appRouter } from "./routers";
import { createContext } from "./trpc";

// Export the router type for use in frontend
export type { AppRouter } from "./routers";

const fastify = Fastify({
  logger: true,
  routerOptions: {
    maxParamLength: 5000,
  },
});

const start = async () => {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin:
        process.env.NODE_ENV === "production"
          ? ["http://localhost:3000"] // Add your production domains here
          : true,
    });

    // Register tRPC
    await fastify.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: {
        router: appRouter,
        createContext,
        onError: ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error);
        },
      },
    });

    // Health check endpoint
    fastify.get("/health", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    const host = process.env.HOST ?? "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
    console.log(`📡 tRPC endpoint: http://${host}:${port}/trpc`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
