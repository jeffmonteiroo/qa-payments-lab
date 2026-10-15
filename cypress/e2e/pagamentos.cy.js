import { CHAVE_ARMAZENAMENTO } from '../../src/repositorioLocal.js';

function preencher(referencia, empresa, valor) {
  cy.get('#codigoBarras').type(referencia);
  cy.get('#empresa').type(empresa);
  cy.get('#valor').type(valor);
}

describe('E2E: aplicação local completa, sem serviço externo', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.removeItem(CHAVE_ARMAZENAMENTO);
      }
    });
  });

  it('registra, consulta o último e mantém o resultado após recarregar', () => {
    cy.get('[data-cy=sem-registro]').should('be.visible');
    preencher('DEMO-001', 'Energia Exemplo', '99,99');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('[data-cy=ultimo-registro]').should('contain', 'padrão').and('contain', '99,99');
    preencher('DEMO-002', 'Água Exemplo', '100,01');
    cy.contains('button', 'Registrar simulação').click();
    cy.contains('button', 'Consultar último registro').click();
    cy.get('[data-cy=ultimo-registro]')
      .should('contain', 'DEMO-002')
      .and('contain', 'Água Exemplo')
      .and('contain', 'cara');
    cy.reload();
    cy.get('[data-cy=ultimo-registro]')
      .should('contain', 'DEMO-002')
      .and('contain', '100,01')
      .and('not.contain', 'DEMO-001');
    cy.screenshot('registro-persistido', { capture: 'viewport' });
  });

  it('impede dados inválidos e aceita a correção no limite de R$ 100,00', () => {
    cy.viewport(390, 844);
    preencher('DEMO-003', 'Internet Exemplo', '0');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('[role=alert]').should('be.visible');
    cy.get('[data-cy=ultimo-registro]').should('not.exist');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(CHAVE_ARMAZENAMENTO)).to.equal(null);
    });
    cy.get('#valor').clear().type('100,00');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('[role=alert]').should('not.exist');
    cy.get('[data-cy=ultimo-registro]')
      .should('contain', '100,00')
      .and('contain', 'padrão')
      .and('contain', 'DEMO-003');
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(CHAVE_ARMAZENAMENTO)).pagamento.valor).to.equal(
        100
      );
    });
    cy.screenshot('correcao-mobile', { capture: 'fullPage' });
  });
});
