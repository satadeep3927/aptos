import { router } from "../trpc";
import { userRouter } from "./user";
import { testRouter } from "./test";

export const appRouter = router({
  user: userRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;
