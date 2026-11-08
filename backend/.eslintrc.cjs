module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ["eslint:recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  ignorePatterns: ["node_modules", "coverage"],
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    eqeqeq: ["error", "smart"],
    "no-console": "off",
  },
};
