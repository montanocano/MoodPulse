/**
 * Lightweight Jest configuration for pure unit tests (no React/Expo runtime).
 * Used for: calendarHelpers, statsCalculator, formatters.
 *
 * We intentionally avoid the jest-expo preset here because it loads Expo's
 * `import.meta` winter runtime, which is incompatible with Jest's CJS env.
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

module.exports = config;
