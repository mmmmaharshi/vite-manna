import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import ultracite from "ultracite/oxfmt";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig, lazyPlugins } from "vite-plus";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@heroui")) {
            return "heroui";
          }

          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
  // Same Oxfmt preset as `oxfmt.config.ts` so `vp check` and `ultracite fix` agree.
  fmt: {
    ...ultracite,
    ignorePatterns: [
      ...(ultracite.ignorePatterns ?? []),
      "**/.agents",
      "**/.opencode",
      "**/public",
      "index.html",
      "src/assets/fonts",
    ],
  },
  /*
   * A deliberate subset of the Oxlint presets in `oxlint.config.ts`.
   * shortcut: `vp check` lints type-aware, and extending the presets here
   * (`extends: [core, react, vitest, antiSlop, shadcn, gdp]`, which this schema
   * does support) surfaces ~40 type-aware violations — strict-boolean-expressions,
   * no-misused-promises, promise-function-async, no-confusing-void-expression —
   * that the app does not satisfy yet. Replace this list with the presets once
   * they are fixed.
   */
  lint: {
    categories: {
      correctness: "warn",
    },
    env: {
      builtin: true,
    },
    ignorePatterns: ["dist", ".agents/**", ".opencode/**", "public/**"],
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        env: {
          browser: true,
        },
        files: ["**/*.{ts,tsx}"],
        plugins: ["react"],
        rules: {
          "constructor-super": "error",
          "for-direction": "error",
          "getter-return": "error",
          "no-array-constructor": "error",
          "no-async-promise-executor": "error",
          "no-case-declarations": "error",
          "no-class-assign": "error",
          "no-compare-neg-zero": "error",
          "no-cond-assign": "error",
          "no-const-assign": "error",
          "no-constant-binary-expression": "error",
          "no-constant-condition": "error",
          "no-control-regex": "error",
          "no-debugger": "error",
          "no-delete-var": "error",
          "no-dupe-class-members": "error",
          "no-dupe-else-if": "error",
          "no-dupe-keys": "error",
          "no-duplicate-case": "error",
          "no-empty": "error",
          "no-empty-character-class": "error",
          "no-empty-pattern": "error",
          "no-empty-static-block": "error",
          "no-ex-assign": "error",
          "no-extra-boolean-cast": "error",
          "no-fallthrough": "error",
          "no-func-assign": "error",
          "no-global-assign": "error",
          "no-import-assign": "error",
          "no-invalid-regexp": "error",
          "no-irregular-whitespace": "error",
          "no-loss-of-precision": "error",
          "no-misleading-character-class": "error",
          "no-new-native-nonconstructor": "error",
          "no-nonoctal-decimal-escape": "error",
          "no-obj-calls": "error",
          "no-prototype-builtins": "error",
          "no-redeclare": "error",
          "no-regex-spaces": "error",
          "no-self-assign": "error",
          "no-setter-return": "error",
          "no-shadow-restricted-names": "error",
          "no-sparse-arrays": "error",
          "no-this-before-super": "error",
          "no-unassigned-vars": "error",
          "no-undef": "error",
          "no-unexpected-multiline": "error",
          "no-unreachable": "error",
          "no-unsafe-finally": "error",
          "no-unsafe-negation": "error",
          "no-unsafe-optional-chaining": "error",
          "no-unused-expressions": "error",
          "no-unused-labels": "error",
          "no-unused-private-class-members": "error",
          "no-unused-vars": [
            "error",
            {
              argsIgnorePattern: "^_",
              caughtErrorsIgnorePattern: "^_",
              varsIgnorePattern: "^_",
            },
          ],
          "no-useless-assignment": "error",
          "no-useless-backreference": "error",
          "no-useless-catch": "error",
          "no-useless-escape": "error",
          "no-with": "error",
          "preserve-caught-error": "error",
          "react/error-boundaries": "error",
          "react/exhaustive-deps": "warn",
          "react/globals": "error",
          "react/immutability": "error",
          "react/incompatible-library": "warn",
          "react/only-export-components": [
            "error",
            {
              allowConstantExport: true,
            },
          ],
          "react/preserve-manual-memoization": "error",
          "react/purity": "error",
          "react/refs": "error",
          "react/rules-of-hooks": "error",
          "react/set-state-in-effect": "error",
          "react/set-state-in-render": "error",
          "react/static-components": "error",
          "react/unsupported-syntax": "warn",
          "react/use-memo": "error",
          "require-yield": "error",
          "typescript/ban-ts-comment": "error",
          "typescript/no-duplicate-enum-values": "error",
          "typescript/no-empty-object-type": "error",
          "typescript/no-explicit-any": "error",
          "typescript/no-extra-non-null-assertion": "error",
          "typescript/no-misused-new": "error",
          "typescript/no-namespace": "error",
          "typescript/no-non-null-asserted-optional-chain": "error",
          "typescript/no-require-imports": "error",
          "typescript/no-this-alias": "error",
          "typescript/no-unnecessary-type-constraint": "error",
          "typescript/no-unsafe-declaration-merging": "error",
          "typescript/no-unsafe-function-type": "error",
          "typescript/no-wrapper-object-types": "error",
          "typescript/prefer-as-const": "error",
          "typescript/prefer-namespace-keyword": "error",
          "typescript/triple-slash-reference": "error",
          "use-isnan": "error",
          "valid-typeof": "error",
        },
      },
    ],
    plugins: ["oxc", "typescript", "unicorn"],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  plugins: lazyPlugins(() => [
    tailwindcss(),
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: "module",
      },
      filename: "sw.ts",
      injectManifest: {
        globIgnores: ["**/bible.json"],
        globPatterns: ["**/*.{css,js,html,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        background_color: "#ffffff",
        description: "Offline Telugu Bible reader",
        display: "standalone",
        icons: [
          {
            purpose: "any",
            sizes: "any",
            src: "favicon.svg",
            type: "image/svg+xml",
          },
          {
            purpose: "any",
            sizes: "192x192",
            src: "icon-192.png",
            type: "image/png",
          },
          {
            purpose: "any",
            sizes: "512x512",
            src: "icon-512.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "192x192",
            src: "icon-192.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "icon-512.png",
            type: "image/png",
          },
        ],
        lang: "te",
        name: "Manna - Telugu Bible",
        short_name: "Manna",
        theme_color: "#ffffff",
      },
      registerType: "prompt",
      srcDir: "src",
      strategies: "injectManifest",
    }),
  ]),
  server: {
    allowedHosts: true,
    host: true,
  },
  staged: {
    "*": "vp check --fix",
  },
});
