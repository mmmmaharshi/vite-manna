import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Project-specific exclusions the Ultracite preset doesn't cover: vendored
  // skills/agent state, static data, and the hand-minified critical CSS.
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/.agents",
    "**/.opencode",
    "**/public",
    "index.html",
    "src/assets/fonts",
  ],
});
