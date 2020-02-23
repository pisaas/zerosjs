module.exports = {
  testEnvironment: '<rootDir>/env/env.js',
  rootDir: './test',
  coverageDirectory: '../.coverage',
  setupFiles: [],
  setupFilesAfterEnv: [],
  globalSetup: '<rootDir>/env/setup.js',
  globalTeardown: '<rootDir>/env/teardown.js',
  roots: [
    '../test'
  ]
};
