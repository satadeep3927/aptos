import dns from "dns/promises";
import { isIP } from "net";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Resolves the DATABASE_URL hostname to IPv4 to avoid Node.js IPv6 ETIMEDOUT
 * issues, then creates a PrismaClient with the pg adapter using the resolved IP.
 * The original hostname is preserved as SSL `servername` for Neon's SNI routing.
 */
async function createPrismaClient(): Promise<PrismaClient> {
  const url = new URL(process.env.DATABASE_URL!);
  const originalHost = url.hostname;

  // If the host is a hostname (not already an IP), resolve to IPv4
  if (isIP(originalHost) === 0) {
    const [ipv4] = await dns.resolve4(originalHost);
    url.hostname = ipv4;
  }

  // Remove sslmode from URL — we configure SSL explicitly below
  url.searchParams.delete("sslmode");

  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: false,
      servername: originalHost,
    },
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: Promise<PrismaClient>;
};

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
