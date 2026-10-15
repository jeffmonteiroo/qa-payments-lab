import {
  classificarValor,
  criarPagamento,
  ServicoDePagamento
} from '../../src/servicoDePagamento.js';
import { converterValor } from '../../src/valorDoFormulario.js';

describe('Unitários: classificação e registro de contas', () => {
  for (const [valor, categoria] of [
    [99.99, 'padrão'],
    [100, 'padrão'],
    [100.01, 'cara']
  ]) {
    it(`classifica o valor de fronteira ${valor}`, () => {
      expect(classificarValor(valor)).to.equal(categoria);
    });
  }
  it('rejeita referência vazia, valor zero e valor com três casas decimais', () => {
    // O módulo e o runner podem usar realms diferentes; compare o nome do erro,
    // sem depender da identidade do construtor TypeError de outra janela.
    for (const [referencia, valor] of [['', 10], ['DEMO', 0], ['DEMO', 100.001]]) {
      expect(() => criarPagamento(referencia, 'Empresa Exemplo', valor))
        .to.throw()
        .and.have.property('name', 'TypeError');
    }
  });
  it('converte valores com vírgula sem aceitar texto misturado', () => {
    expect(converterValor('100,01')).to.equal(100.01);
    expect(converterValor('100abc')).to.be.NaN;
  });
  it('retorna a última das duas contas registradas', () => {
    const servico = new ServicoDePagamento();
    expect(servico.consultarUltimoPagamento()).to.be.undefined;
    servico.pagar('DEMO-A', 'Empresa A', 99.99);
    servico.pagar('DEMO-B', 'Empresa B', 100.01);
    expect(servico.consultarUltimoPagamento()).to.deep.equal({
      codigoBarras: 'DEMO-B',
      empresa: 'Empresa B',
      valor: 100.01,
      categoria: 'cara'
    });
  });
});
