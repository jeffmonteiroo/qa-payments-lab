import { useRef, useState } from 'react';
import { validarPagamento } from '../servicoDePagamento.js';
import { converterValor } from '../valorDoFormulario.js';

const vazio = { codigoBarras: '', empresa: '', valor: '' };

export function FormularioPagamento({ onRegistrar }) {
  const [campos, setCampos] = useState(vazio);
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState('');
  const formulario = useRef(null);

  function registrar(event) {
    event.preventDefault();
    const valor = converterValor(campos.valor);
    const novosErros = validarPagamento(campos.codigoBarras, campos.empresa, valor);
    setErros(novosErros);
    setFalha('');
    if (Object.keys(novosErros).length) {
      formulario.current.elements.namedItem(Object.keys(novosErros)[0]).focus();
      return;
    }
    try {
      onRegistrar(campos.codigoBarras, campos.empresa, valor);
      setCampos(vazio);
      formulario.current.elements.namedItem('codigoBarras').focus();
    } catch {
      setFalha(
        'Não foi possível salvar. Seus campos foram mantidos. Verifique o armazenamento do navegador e tente novamente.'
      );
    }
  }

  function campo(nome, titulo, placeholder, limite) {
    return (
      <div className="field">
        <label htmlFor={nome}>{titulo}</label>
        <input
          id={nome}
          name={nome}
          value={campos[nome]}
          placeholder={placeholder}
          maxLength={limite}
          required
          autoComplete="off"
          inputMode={nome === 'valor' ? 'decimal' : 'text'}
          aria-invalid={Boolean(erros[nome])}
          aria-describedby={erros[nome] ? `${nome}-erro` : undefined}
          onChange={(event) => setCampos({ ...campos, [nome]: event.target.value })}
        />
        {erros[nome] && (
          <p className="field-error" id={`${nome}-erro`}>
            {erros[nome]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form ref={formulario} onSubmit={registrar} noValidate>
      {campo('codigoBarras', 'Referência da conta', 'Ex.: CONTA-DEMO-001', 80)}
      {campo('empresa', 'Empresa fictícia', 'Ex.: Energia Exemplo', 100)}
      {campo('valor', 'Valor (R$)', 'Ex.: 100,00', 12)}
      <p className="field-hint">
        Use vírgula ou ponto e até 2 casas decimais. Sem separador de milhares.
      </p>
      {Object.keys(erros).length > 0 && (
        <p className="alert error" role="alert">
          Confira os campos indicados antes de registrar.
        </p>
      )}
      {falha && (
        <p className="alert error" role="alert">
          {falha}
        </p>
      )}
      <button type="submit" className="button primary">
        Registrar simulação <span aria-hidden="true">↗</span>
      </button>
      <p className="privacy-note">Somente dados fictícios. Nenhum pagamento será realizado.</p>
    </form>
  );
}
