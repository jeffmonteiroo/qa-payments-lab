import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 900,
  retries: { runMode: 0, openMode: 0 },
  reporter: 'junit',
  reporterOptions: { mochaFile: 'reports/cypress/result-[hash].xml', toConsole: false },
  component: {
    devServer: { framework: 'react', bundler: 'vite' },
    specPattern: 'cypress/component/**/*.cy.jsx',
    supportFile: 'cypress/support/component.jsx'
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false
  }
});
