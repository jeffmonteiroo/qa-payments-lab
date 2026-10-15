import { defineConfig } from 'cypress';

// Runner de navegador, mas testes unitários puros: sem cy.visit, DOM ou cy.mount.
export default defineConfig({
  video: false,
  reporter: 'junit',
  reporterOptions: { mochaFile: 'reports/cypress/unit-[hash].xml' },
  e2e: { specPattern: 'cypress/unit/**/*.cy.js', supportFile: false }
});
