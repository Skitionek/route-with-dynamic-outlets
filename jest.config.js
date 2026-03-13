const { createEsmPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createEsmPreset(),
  testMatch: ['**/test/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!tslib|rxjs)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
