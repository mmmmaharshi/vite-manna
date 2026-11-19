import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // WARNING: keep these ignores; `fix` must not rewrite hand-minified CSS or vendored state.
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/.agents",
    "**/.opencode",
    "**/public",
    "index.html",
    "src/assets/fonts",
  ],
});
