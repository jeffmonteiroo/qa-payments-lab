import React from 'react';
import App from '../../src/App.jsx';
import { CHAVE_ARMAZENAMENTO } from '../../src/repositorioLocal.js';

function registrar(valor = '100,00') {
  cy.get('#codigoBarras').type('DEMO-001');
  cy.get('#empresa').type('Energia Exemplo');
  cy.get('#valor').type(valor);
  cy.contains('button', 'Registrar simulação').click();
}

describe('Componente: integração local do App', () => {
  beforeEach(() => {
    cy.window().then((win) => win.localStorage.removeItem(CHAVE_ARMAZENAMENTO));
  });

  it('recupera de JSON corrompido sem apagar dados na abertura', () => {
    cy.window().then((win) => win.localStorage.setItem(CHAVE_ARMAZENAMENTO, '{corrompido'));
    cy.mount(<App />);
    cy.contains('Não foi possível ler o registro salvo').should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(CHAVE_ARMAZENAMENTO)).to.equal('{corrompido');
    });
    registrar();
    cy.get('[data-cy=ultimo-registro]').should('contain', 'DEMO-001');
    cy.contains('Não foi possível ler o registro salvo').should('not.exist');
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(CHAVE_ARMAZENAMENTO)).pagamento.valor).to.equal(
        100
      );
    });
  });

  it('mantém o resultado anterior e os campos quando o storage recusa escrita', () => {
    cy.mount(<App />);
    registrar();
    cy.window().then((win) => {
      cy.stub(win.Storage.prototype, 'setItem').throws(new Error('QuotaExceededError'));
    });
    registrar('150,00');
    cy.get('[role=alert]').should('contain', 'Não foi possível salvar');
    cy.get('[data-cy=ultimo-registro]').should('contain', '100,00').and('contain', 'padrão');
    cy.get('#valor').should('have.value', '150,00');
  });
});
