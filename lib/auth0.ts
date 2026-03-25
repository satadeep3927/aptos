import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const auth0 = new Auth0Client({
  async onCallback(error, ctx, session) {
    if (error || !session) {
      return NextResponse.redirect(new URL("/", ctx.appBaseUrl));
    }

    const { sub, email, name, picture } = session.user;

    await db.user.upsert({
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
    });

    const dbUser = await db.user.findUnique({ where: { auth0Id: sub } });

    const redirectUrl = dbUser?.onboarded ? "/" : "/onboarding";
    return NextResponse.redirect(new URL(redirectUrl, ctx.appBaseUrl));
  },
});
