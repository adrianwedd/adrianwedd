export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],
  collectCoverageFrom: ['assets/**/*.js', '!assets/**/*.test.js', '!assets/**/*.spec.js'],
  // Coverage thresholds disabled initially to establish baseline
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80
  //   }
  // },
  testMatch: ['<rootDir>/tests/unit/**/*.test.js', '<rootDir>/tests/unit/**/*.spec.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  preset: null,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
