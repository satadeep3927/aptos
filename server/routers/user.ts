import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { sub, email, name, picture } = ctx.user;

    const dbUser = await ctx.db.user.upsert({
      where: { auth0Id: sub },
      create: {
        auth0Id: sub,
        email: email ?? "",
        name: name ?? null,
        picture: picture ?? null,
      },
      update: {
        email: email ?? undefined,
        name: name ?? undefined,
        picture: picture ?? undefined,
      },
      include: { onboarding: true },
    });

    return dbUser;
  }),

  submitOnboarding: protectedProcedure
    .input(
      z.object({
        testType: z.enum(["ccat", "wonderlic", "both"]),
        testDate: z.string().optional(),
        weakAreas: z.array(z.string()),
        goal: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.db.user.findUnique({
        where: { auth0Id: ctx.user.sub },
      });

      if (!dbUser) {
        throw new Error("User not found in database");
      }

      const onboarding = await ctx.db.onboarding.upsert({
        where: { userId: dbUser.id },
        create: {
          userId: dbUser.id,
          testType: input.testType,
          testDate: input.testDate,
          weakAreas: input.weakAreas,
          goal: input.goal,
        },
        update: {
          testType: input.testType,
          testDate: input.testDate,
          weakAreas: input.weakAreas,
          goal: input.goal,
        },
      });

      await ctx.db.user.update({
        where: { id: dbUser.id },
        data: { onboarded: true },
      });

      return onboarding;
    }),
});
