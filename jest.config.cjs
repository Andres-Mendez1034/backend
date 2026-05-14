/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  verbose: true,

  transform: {
    "^.+\\.js$": "babel-jest"
  },

  transformIgnorePatterns: [],

  testMatch: ["**/test-QA/**/*.test.js"],

  setupFiles: ["<rootDir>/test-QA/setup/env.test.js"],

  setupFilesAfterEnv: ["<rootDir>/test-QA/setup/setup.js"],

  reporters: [
    "default",
    "<rootDir>/test-QA/setup/test-reporter.js"
  ],

  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  }
};