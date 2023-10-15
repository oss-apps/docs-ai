/** @type {import("eslint").Linter.Config} */

module.exports = {
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: "tsconfig.json",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "ignorePatterns": ["theme.config.tsx", "embed.js", "embed.min.js", "**.js"],
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-misused-promises": [
      "off",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-member-access": "off"
  },
};
