import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  env: core.env,
  extends: [core, react, vitest],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "**/.agents",
    "**/.opencode",
    "**/public",
  ],
  jsPlugins: [
    {
      name: "vite-plus",
      specifier: "vite-plus/oxlint-plugin",
    },
  ],
  // Carried over from the project's Vite+ lint config: Vite+ requires its own
  // entry points, so `vite`/`vitest` imports must go through `vite-plus`.
  rules: {
    "vite-plus/prefer-vite-plus-imports": "error",
  },
});
