module.exports = {
  projects: [
    '<rootDir>/apps/api/jest.config.js',
    '<rootDir>/apps/mobile/jest.config.js',
    '<rootDir>/packages/shared/jest.config.js',
    '<rootDir>/apps/iot-aggregator/jest.config.js'
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
