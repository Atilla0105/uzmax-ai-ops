import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "apps/admin/dist/**",
      "coverage/**",
      "dist/**",
      "*.json",
      "node_modules/**",
      "package-lock.json",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      complexity: ["error", { max: 10 }],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }]
    }
  },
  {
    files: ["apps/**/*.tsx"],
    rules: {
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }]
    }
  },
  {
    files: ["apps/api/**/*.service.ts", "apps/api/**/*.controller.ts"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }]
    }
  },
  {
    files: ["scripts/**/*.mjs", "scripts/**/*.cjs", "packages/**/*.mjs"],
    rules: {
      complexity: ["error", { max: 10 }],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }]
    }
  },
  {
    files: ["scripts/**/*.mjs", "scripts/**/*.cjs", "packages/**/*.mjs", "*.config.*"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        module: "readonly",
        process: "readonly"
      }
    }
  }
);
