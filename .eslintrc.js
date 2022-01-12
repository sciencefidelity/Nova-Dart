module.exports = {
  env: {
    es6: true,
    node: true,
    "nova/nova": true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "nova"],
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double", { avoidEscape: true }],
    semi: ["error", "never"],
    "no-unused-vars": [
      "warn",
      { varsIgnorePattern: "[iI]gnored", argsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { varsIgnorePattern: "[iI]gnored", argsIgnorePattern: "^_" }
    ]
  }
}
