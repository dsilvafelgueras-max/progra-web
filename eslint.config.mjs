import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-build/**",
    ".next-runtime/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy and parallel workspaces kept in the repo:
    "nextjs-app/**",
    "react-app/**",
    "js/**",
  ]),
]);

export default eslintConfig;
