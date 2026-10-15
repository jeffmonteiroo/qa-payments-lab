export const LIMITE_PADRAO = 100;
export const VALOR_MAXIMO = 999999.99;

export function validarPagamento(codigoBarras, empresa, valor) {
  const erros = {};
  if (typeof codigoBarras !== 'string' || !codigoBarras.trim() || codigoBarras.trim().length > 80) {
    erros.codigoBarras = 'Informe uma referência de 1 a 80 caracteres.';
  }
  if (typeof empresa !== 'string' || !empresa.trim() || empresa.trim().length > 100) {
    erros.empresa = 'Informe uma empresa de 1 a 100 caracteres.';
  }
  if (
    typeof valor !== 'number' ||
    !Number.isFinite(valor) ||
    valor <= 0 ||
    valor > VALOR_MAXIMO ||
    valor !== Math.round(valor * 100) / 100
  ) {
    erros.valor = 'Informe um valor de R$ 0,01 a R$ 999.999,99, com até 2 casas decimais.';
  }
  return erros;
}

export function classificarValor(valor) {
  const { valor: erro } = validarPagamento('referencia', 'empresa', valor);
  if (erro) throw new TypeError(erro);
  return valor > LIMITE_PADRAO ? 'cara' : 'padrão';
}

export function criarPagamento(codigoBarras, empresa, valor) {
  const erros = validarPagamento(codigoBarras, empresa, valor);
  if (Object.keys(erros).length) throw new TypeError(Object.values(erros).join(' '));
  return {
    codigoBarras: codigoBarras.trim(),
    empresa: empresa.trim(),
    valor: Math.round(valor * 100) / 100,
    categoria: classificarValor(valor)
  };
}

// Sem DOM ou dependência do navegador. O armazenamento é opcional e injetado.
export class ServicoDePagamento {
  #pagamentos = [];
  #repositorio;

  constructor(repositorio) {
    this.#repositorio = repositorio;
    const ultimo = repositorio?.carregarUltimo?.();
    if (ultimo)
      this.#pagamentos.push(criarPagamento(ultimo.codigoBarras, ultimo.empresa, ultimo.valor));
  }

  pagar(codigoBarras, empresa, valor) {
    const pagamento = criarPagamento(codigoBarras, empresa, valor);
    // Só altera a memória depois de persistir com sucesso.
    this.#repositorio?.salvar(pagamento);
    this.#pagamentos.push(pagamento);
    return { ...pagamento };
  }

  consultarUltimoPagamento() {
    const ultimo = this.#pagamentos.at(-1);
    return ultimo ? { ...ultimo } : undefined;
  }
}
