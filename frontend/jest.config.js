// jest.config.js
module.exports = {
  // Look for test files in the 'src' directory
  roots: ["<rootDir>/src"],
  // Files matching test_*.js|jsx|ts|tsx or *.test.js|jsx|ts|tsx
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  // Use jsdom environment for browser-like testing
  testEnvironment: "jest-environment-jsdom",
  // File that runs before all tests (for global setup)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "@swc/jest",
  },
  // Ensure we can handle module imports correctly
  moduleNameMapper: {
    // This maps the '@/' alias often used in Next.js to your actual 'src' folder
    // It makes imports reliable, e.g., 'import Page from '@/app/page'
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
};