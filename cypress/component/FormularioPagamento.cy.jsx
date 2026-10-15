import React from 'react';
import { FormularioPagamento } from '../../src/components/FormularioPagamento.jsx';

function preencher(valor = '100,01') {
  cy.get('#codigoBarras').type('DEMO-001');
  cy.get('#empresa').type('Energia Exemplo');
  cy.get('#valor').type(valor);
}

describe('Componente: FormularioPagamento', () => {
  it('indica os campos obrigatórios e foca a referência ao enviar o formulário vazio', () => {
    cy.mount(<FormularioPagamento onRegistrar={cy.stub().as('registrar')} />);
    cy.contains('button', 'Registrar simulação').click();
    cy.get('[role=alert]').should('contain', 'Confira os campos');
    cy.get('#codigoBarras').should('have.focus').and('have.attr', 'aria-invalid', 'true');
    cy.get('#empresa').should('have.attr', 'aria-describedby', 'empresa-erro');
    cy.get('#valor-erro').should('be.visible');
    cy.get('@registrar').should('not.have.been.called');
  });
  for (const valor of ['0', '10,001']) {
    it(`não envia valor inválido: ${valor}`, () => {
      cy.mount(<FormularioPagamento onRegistrar={cy.stub().as('registrar')} />);
      preencher(valor);
      cy.contains('button', 'Registrar simulação').click();
      cy.get('#valor').should('have.focus').and('have.attr', 'aria-invalid', 'true');
      cy.get('@registrar').should('not.have.been.called');
    });
  }
  it('permite corrigir, envia uma vez e limpa os campos após sucesso', () => {
    cy.mount(<FormularioPagamento onRegistrar={cy.stub().as('registrar')} />);
    preencher('0');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('#valor').clear().type('100,01');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('@registrar').should(
      'have.been.calledOnceWithExactly',
      'DEMO-001',
      'Energia Exemplo',
      100.01
    );
    cy.get('#codigoBarras').should('have.value', '').and('have.focus');
    cy.get('#empresa').should('have.value', '');
    cy.get('#valor').should('have.value', '');
    cy.get('[role=alert]').should('not.exist');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('@registrar').should('have.been.calledOnce');
  });
  it('preserva os campos se o salvamento falhar e permite tentar novamente', () => {
    const registrar = cy.stub().as('registrar');
    registrar.onFirstCall().throws(new Error('Sem espaço'));
    cy.mount(<FormularioPagamento onRegistrar={registrar} />);
    preencher();
    cy.contains('button', 'Registrar simulação').click();
    cy.get('[role=alert]').should('contain', 'Não foi possível salvar');
    cy.get('#valor').should('have.value', '100,01');
    cy.contains('button', 'Registrar simulação').click();
    cy.get('@registrar').should('have.been.calledTwice');
    cy.get('[role=alert]').should('not.exist');
    cy.get('#valor').should('have.value', '');
  });
  it('permite envio pelo teclado', () => {
    cy.mount(<FormularioPagamento onRegistrar={cy.stub().as('registrar')} />);
    preencher('99.99');
    cy.get('#valor').type('{enter}');
    cy.get('@registrar').should(
      'have.been.calledOnceWithExactly',
      'DEMO-001',
      'Energia Exemplo',
      99.99
    );
  });
});
