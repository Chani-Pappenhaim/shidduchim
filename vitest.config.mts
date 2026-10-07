import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const alias = { "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)) };

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: { alias },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"], exclude: ["src/**/*.db.test.ts"], environment: "node" },
      },
      {
        // Service tests against the local database (run one file at a time, see the test:db script); each file creates and removes its own matchmaker
        extends: true,
        test: { name: "db", include: ["src/**/*.db.test.ts"], setupFiles: ["dotenv/config"], testTimeout: 30_000, hookTimeout: 60_000 },
      },
    ],
  },
});
