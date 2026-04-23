module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 60000,
  verbose: true,
  clearMocks: true,
  forceExit: true,
  detectOpenHandles: false,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "models/**/*.js",
    "app.js"
  ],
  coverageDirectory: "coverage"
};
