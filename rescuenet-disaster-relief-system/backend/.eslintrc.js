module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "script"
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-console": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-underscore-dangle": "off",
    eqeqeq: ["error", "always"],
    "prefer-const": "warn",
    "no-var": "error",
    "no-process-exit": "off",
    "consistent-return": "off"
  },
  ignorePatterns: ["node_modules/", "coverage/", "logs/"]
};
