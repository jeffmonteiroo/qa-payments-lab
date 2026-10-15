// Aceita vírgula ou ponto decimal, sem separador de milhares e sem arredondar entradas inválidas.
export function converterValor(texto) {
  if (typeof texto !== 'string' || !/^\d+(?:[.,]\d{1,2})?$/.test(texto.trim())) return NaN;
  return Number(texto.trim().replace(',', '.'));
}
