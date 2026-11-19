import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import gdp from "ultracite/oxlint/gdp";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import landmines from "ultracite/oxlint/landmines";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import vitest from "ultracite/oxlint/vitest";

const jsPlugins = selectJsPlugins([
  "github",
  "sonarjs",
  "react-doctor",
  "tsdoc",
  "jsdoc-js",
]);

export default defineConfig({
  env: core.env,
  extends: [core, react, vitest, gdp, jsPlugins, shadcn, landmines, antiSlop],
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
  settings: jsPluginSettings,
  // WARNING: removing this override breaks `bun run check`; the sleep has no awaiting work to wrap.
  overrides: [
    {
      files: ["src/shared/lib/wait-for-fonts.ts"],
      rules: {
        "promise/avoid-new": "off",
      },
    },
  ],
  // WARNING: `vite`/`vitest` imports must go through `vite-plus`, or `vp lint` fails.
  rules: {
    "vite-plus/prefer-vite-plus-imports": "error",
  },
});
