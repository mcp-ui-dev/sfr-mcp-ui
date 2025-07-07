module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        types: ['jest', 'node']
      }
    }],
  },
  moduleNameMapper: {
    '^agents/mcp$': '<rootDir>/node_modules/agents/dist/mcp/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(agents|@modelcontextprotocol|@mcp-ui)/)'
  ]
};