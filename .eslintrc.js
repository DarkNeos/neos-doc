module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    project: ['tsconfig.json'],
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
