import assert from 'node:assert/strict';
import {
  ServicoDePagamento,
  criarPagamento,
  classificarValor,
  validarPagamento
} from '../src/servicoDePagamento.js';
import { converterValor } from '../src/valorDoFormulario.js';

describe('Regras de negócio: limites e entradas inválidas', function () {
  for (const [valor, categoria] of [
    [99.99, 'padrão'],
    [100, 'padrão'],
    [100.01, 'cara'],
    [0.01, 'padrão'],
    [1.15, 'padrão'],
    [999999.99, 'cara']
  ]) {
    it(`classifica ${valor} como ${categoria}`, function () {
      assert.equal(classificarValor(valor), categoria);
    });
  }
  for (const [cenario, valor] of [
    ['valor zero', 0],
    ['valor negativo', -1],
    ['NaN', NaN],
    ['infinito positivo', Infinity],
    ['infinito negativo', -Infinity],
    ['valor informado como texto', '100'],
    ['valor nulo', null],
    ['valor não informado', undefined],
    ['valor com três casas decimais', 100.001],
    ['valor acima de R$ 999.999,99', 1000000],
    ['fração menor que um centavo', 1e-9],
    ['precisão extra após os centavos', 100.000000001]
  ]) {
    it(`rejeita ${cenario}`, function () {
      const servico = new ServicoDePagamento();
      assert.throws(() => servico.pagar('DEMO', 'Empresa', valor), TypeError);
      assert.equal(servico.consultarUltimoPagamento(), undefined);
    });
  }
  for (const [cenario, referencia, empresa] of [
    ['referência vazia', '', 'Empresa'],
    ['referência só com espaços', '   ', 'Empresa'],
    ['referência nula', null, 'Empresa'],
    ['referência com mais de 80 caracteres', 'a'.repeat(81), 'Empresa'],
    ['empresa vazia', 'DEMO', ''],
    ['empresa só com espaços', 'DEMO', '  '],
    ['empresa nula', 'DEMO', null],
    ['empresa com mais de 100 caracteres', 'DEMO', 'a'.repeat(101)]
  ]) {
    it(`rejeita ${cenario}`, function () {
      assert.throws(() => criarPagamento(referencia, empresa, 10), TypeError);
    });
  }
  it('remove espaços das extremidades da referência e da empresa', function () {
    assert.deepEqual(criarPagamento(' DEMO-01 ', ' Empresa Exemplo ', 10.1), {
      codigoBarras: 'DEMO-01',
      empresa: 'Empresa Exemplo',
      valor: 10.1,
      categoria: 'padrão'
    });
  });
  it('retorna todos os erros para orientar o formulário', function () {
    assert.deepEqual(Object.keys(validarPagamento('', '', NaN)), [
      'codigoBarras',
      'empresa',
      'valor'
    ]);
  });
  it('protege o estado interno contra alterações dos objetos retornados', function () {
    const servico = new ServicoDePagamento();
    const retorno = servico.pagar('DEMO', 'Empresa', 100);
    retorno.valor = 1;
    const consulta = servico.consultarUltimoPagamento();
    consulta.categoria = 'cara';
    assert.equal(servico.consultarUltimoPagamento().valor, 100);
    assert.equal(servico.consultarUltimoPagamento().categoria, 'padrão');
  });
  it('mantém o último pagamento quando a próxima entrada é inválida', function () {
    const servico = new ServicoDePagamento();
    const anterior = servico.pagar('DEMO', 'Empresa', 100);
    assert.throws(() => servico.pagar('INVALIDO', 'Empresa', 0));
    assert.deepEqual(servico.consultarUltimoPagamento(), anterior);
  });
});

describe('Conversão do campo monetário', function () {
  for (const entrada of ['100,01', '100.01', ' 100,01 ']) {
    it(`converte ${JSON.stringify(entrada)} sem depender do locale`, function () {
      assert.equal(converterValor(entrada), 100.01);
    });
  }
  for (const entrada of ['', ' ', '1e2', '100abc', '1.000,00', '10,001', '.5', null]) {
    it(`não converte formato ambíguo/inválido: ${JSON.stringify(entrada)}`, function () {
      assert.ok(Number.isNaN(converterValor(entrada)));
    });
  }
});
