import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import gdp from "ultracite/oxlint/gdp";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  env: core.env,
  extends: [core, react, vitest, gdp, shadcn, antiSlop],
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
    ...shadcn.jsPlugins,
  ],
  // Carried over from the project's Vite+ lint config: Vite+ requires its own
  // entry points, so `vite`/`vitest` imports must go through `vite-plus`.
  overrides: [
    {
      // A sleep has no awaiting work to wrap: the executor only arms a timer,
      // and the language offers no cancellable sleep primitive. Scoped to the
      // one module that needs it.
      files: ["src/shared/lib/wait-for-fonts.ts"],
      rules: {
        "promise/avoid-new": "off",
      },
    },
  ],
  rules: {
    "vite-plus/prefer-vite-plus-imports": "error",
  },
});
