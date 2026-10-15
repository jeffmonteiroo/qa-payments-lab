import assert from 'node:assert/strict';
import { criarRepositorioLocal, CHAVE_ARMAZENAMENTO } from '../src/repositorioLocal.js';
import { ServicoDePagamento } from '../src/servicoDePagamento.js';

function armazenamentoFake() {
  const itens = new Map();
  return {
    getItem: (chave) => itens.get(chave) ?? null,
    setItem: (chave, valor) => itens.set(chave, valor)
  };
}

describe('Persistência local com dependência injetada', function () {
  it('retorna undefined quando não há registro', function () {
    assert.equal(criarRepositorioLocal(armazenamentoFake()).carregarUltimo(), undefined);
  });
  it('restaura apenas o último registro em uma nova instância', function () {
    const repositorio = criarRepositorioLocal(armazenamentoFake());
    const primeiro = new ServicoDePagamento(repositorio);
    primeiro.pagar('DEMO-1', 'Empresa A', 99.99);
    const ultimo = primeiro.pagar('DEMO-2', 'Empresa B', 100.01);
    const restaurado = new ServicoDePagamento(repositorio);
    assert.deepEqual(restaurado.consultarUltimoPagamento(), ultimo);
  });
  it('não aceita categoria adulterada no armazenamento', function () {
    const storage = armazenamentoFake();
    storage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify({
        versao: 1,
        pagamento: { codigoBarras: 'DEMO', empresa: 'Empresa', valor: 100, categoria: 'cara' }
      })
    );
    assert.equal(criarRepositorioLocal(storage).carregarUltimo().categoria, 'padrão');
  });
  for (const texto of [
    '{inválido',
    'null',
    '{}',
    '{"versao":2,"pagamento":{}}',
    '{"versao":1,"pagamento":{"valor":-1}}'
  ]) {
    it(`rejeita registro corrompido sem apagá-lo: ${texto}`, function () {
      const storage = armazenamentoFake();
      storage.setItem(CHAVE_ARMAZENAMENTO, texto);
      assert.throws(() => criarRepositorioLocal(storage).carregarUltimo());
      assert.equal(storage.getItem(CHAVE_ARMAZENAMENTO), texto);
    });
  }
  it('não altera o último pagamento quando a gravação falha', function () {
    let falhar = false;
    const servico = new ServicoDePagamento({
      salvar() {
        if (falhar) throw new Error('Sem espaço');
      }
    });
    const anterior = servico.pagar('DEMO-1', 'Empresa A', 100);
    falhar = true;
    assert.throws(() => servico.pagar('DEMO-2', 'Empresa B', 150), /Sem espaço/);
    assert.deepEqual(servico.consultarUltimoPagamento(), anterior);
  });
});
