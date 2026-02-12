import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

declare global {
  var realFoodFinderPool: Pool | undefined;
}

export function getDb() {
  const databaseUrl =
    process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  const pool =
    global.realFoodFinderPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    global.realFoodFinderPool = pool;
  }

  return drizzle({
    client: pool,
    schema,
  });
}
