import assert from 'node:assert/strict';
import { ServicoDePagamento } from '../src/servicoDePagamento.js';

describe('Serviço de Pagamento', function () {
  it('deve classificar como cara uma conta acima de R$ 100,00', function () {
    const servico = new ServicoDePagamento();

    const pagamento = servico.pagar(
      '0987-7656-3475',
      'Companhia de Água',
      156.87
    );

    assert.equal(pagamento.categoria, 'cara');
  });

  it('deve classificar como padrão uma conta igual a R$ 100,00', function () {
    const servico = new ServicoDePagamento();

    const pagamento = servico.pagar(
      '1234-5678-9012',
      'Companhia de Energia',
      100
    );

    assert.equal(pagamento.categoria, 'padrão');
  });

  it('deve classificar como padrão uma conta abaixo de R$ 100,00', function () {
    const servico = new ServicoDePagamento();

    const pagamento = servico.pagar(
      '2222-3333-4444',
      'Internet',
      89.90
    );

    assert.equal(pagamento.categoria, 'padrão');
  });

  it('deve retornar o último pagamento realizado', function () {
    const servico = new ServicoDePagamento();

    servico.pagar('1111-2222-3333', 'Empresa A', 50);
    servico.pagar('4444-5555-6666', 'Empresa B', 250);

    const ultimoPagamento = servico.consultarUltimoPagamento();

    assert.deepEqual(ultimoPagamento, {
      codigoBarras: '4444-5555-6666',
      empresa: 'Empresa B',
      valor: 250,
      categoria: 'cara'
    });
  });

  it('deve retornar undefined quando nenhum pagamento foi realizado', function () {
    const servico = new ServicoDePagamento();

    assert.equal(servico.consultarUltimoPagamento(), undefined);
  });
});
