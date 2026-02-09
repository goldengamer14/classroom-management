import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv"
import { resolve } from "path";
import * as schema from "./schema/index.ts";

console.log(resolve(process.cwd(), "src", ".env"));
dotenv.config({ path: resolve(process.cwd(), "src", ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export { db, pool, schema };

pool.connect()
  .then(client => {
    console.log("Successfully connected to the database!");
    client.release(); // Release the client back to the pool
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err.message);
  });