import * as dotenv from "dotenv";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

// Explicitly tell dotenv where the file is
dotenv.config({ path: resolve(process.cwd(), "src", ".env") });

// If your .env is inside a folder like 'server', use:
console.log(resolve(process.cwd(), "src", ".env"));
// dotenv.config({ path: resolve(process.cwd(), "src") });

console.log("DATABASE_URL check:", process.env.DATABASE_URL ? "Found" : "Not Found");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
    schema: "./src/db/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    }
});