import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/tempus-fugit-client/temporal-logic/**/*.test.ts"],
  },
});