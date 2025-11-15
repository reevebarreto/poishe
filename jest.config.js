/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // jsdom for React components, node for pure API tests
  setupFilesAfterEnv: ["<rootDir>/tests/mocks/setupTests.ts"], // your MSW server
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // path alias for imports
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};
