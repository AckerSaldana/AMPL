import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    baseUrl: 'https://prod-ampl.web.app',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
