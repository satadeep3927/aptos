require("dotenv").config();
const path = require("path");
const { PrismaClient } = require(path.resolve("./lib/generated/prisma/client"));
const { PrismaPg } = require("@prisma/adapter-pg");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  try {
    const result = await db.user.upsert({
      where: { auth0Id: "test" },
      create: { auth0Id: "test", email: "test@test.com", name: null, picture: null },
      update: { email: undefined, name: undefined, picture: undefined },
      include: { onboarding: true },
    });
    console.log("OK", result);
  } catch (e) {
    console.error("FULL ERROR:", e.message);
    console.error("CODE:", e.code);
    console.error("META:", e.meta);
  } finally {
    await db["$disconnect"]();
  }
}

main();
