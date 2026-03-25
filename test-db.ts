import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const res = await sql`SELECT 1 as ok`;
    console.log("HTTP QUERY OK:", res);
  } catch (e: any) {
    console.error("HTTP ERROR:", e.message);
    console.error("STACK:", e.stack);
  }
}

main();
