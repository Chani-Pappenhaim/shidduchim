import { defineConfig } from "prisma/config";

// Schema changes become SQL files in /migrations, applied with `wrangler d1 migrations apply`
export default defineConfig({
  schema: "prisma/schema.prisma",
});
