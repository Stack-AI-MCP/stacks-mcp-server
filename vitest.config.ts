/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import { vitestSetupFilePath, getClarinetVitestsArgv } from "@hirosystems/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // Add separate config for Clarinet integration tests
    ...(process.env.TEST_ENV === 'clarinet' && {
      environment: 'clarinet',
      pool: 'forks',
      poolOptions: {
        threads: { singleThread: true },
        forks: { singleFork: true },
      },
      setupFiles: [
        vitestSetupFilePath,
        // custom setup files can be added here
      ],
      environmentOptions: {
        clarinet: {
          ...getClarinetVitestsArgv(),
          // add or override options
        },
      },
    }),
  },
});