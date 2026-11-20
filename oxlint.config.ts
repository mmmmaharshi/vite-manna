import cloudflare from "@cloudflare/oxlint-config";
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
    ...(cloudflare.jsPlugins ?? []),
  ],
  settings: jsPluginSettings,
  // WARNING: `vite`/`vitest` imports must go through `vite-plus`, or `vp lint` fails.
  rules: {
    ...cloudflare.rules,
    "vite-plus/prefer-vite-plus-imports": "error",
  },
});
