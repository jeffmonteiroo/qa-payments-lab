import { criarPagamento } from './servicoDePagamento.js';

export const CHAVE_ARMAZENAMENTO = 'pgats.pagamentos.ultimo.v1';

export function criarRepositorioLocal(storage) {
  return {
    carregarUltimo() {
      const texto = storage.getItem(CHAVE_ARMAZENAMENTO);
      if (texto === null) return undefined;
      const registro = JSON.parse(texto);
      if (!registro || registro.versao !== 1 || !registro.pagamento) {
        throw new TypeError('Registro local incompatível.');
      }
      const { codigoBarras, empresa, valor } = registro.pagamento;
      // Revalida a entrada e recalcula a categoria; não confia no JSON salvo.
      return criarPagamento(codigoBarras, empresa, valor);
    },
    salvar(pagamento) {
      const validado = criarPagamento(pagamento.codigoBarras, pagamento.empresa, pagamento.valor);
      storage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ versao: 1, pagamento: validado }));
    }
  };
}
