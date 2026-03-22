import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
      sourceType: "module" // <-- treat JS/MJS files as ES modules
    }
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs" } // only CJS files
  }
]);