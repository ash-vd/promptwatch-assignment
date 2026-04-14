import { createTRPCReact } from "@trpc/react-query";
import type {
  AppRouter,
  InferRouterInputs,
  InferRouterOutputs,
} from "@repo/api/src";

type TrpcClient = ReturnType<typeof createTRPCReact<AppRouter>>;

export const trpc: TrpcClient = createTRPCReact<AppRouter>();

export type RouterInputs = InferRouterInputs<AppRouter>;
export type RouterOutputs = InferRouterOutputs<AppRouter>;
