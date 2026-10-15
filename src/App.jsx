import { useState } from 'react';
import { FormularioPagamento } from './components/FormularioPagamento.jsx';
import { ServicoDePagamento } from './servicoDePagamento.js';
import { criarRepositorioLocal } from './repositorioLocal.js';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function iniciar() {
  let repositorio;
  try {
    repositorio = criarRepositorioLocal(window.localStorage);
    return { servico: new ServicoDePagamento(repositorio), aviso: '', persistente: true };
  } catch {
    // Não apaga registros ilegíveis ao abrir a aplicação.
    return {
      servico: new ServicoDePagamento(repositorio ? { salvar: repositorio.salvar } : undefined),
      persistente: Boolean(repositorio),
      aviso: repositorio
        ? 'Não foi possível ler o registro salvo. Um novo registro válido substituirá o anterior.'
        : 'Armazenamento indisponível. Os registros desta sessão não serão mantidos ao recarregar.'
    };
  }
}

export default function App() {
  const [{ servico, aviso: avisoInicial, persistente }] = useState(iniciar);
  const [aviso, setAviso] = useState(avisoInicial);
  const [ultimo, setUltimo] = useState(() => servico.consultarUltimoPagamento());
  const [mensagem, setMensagem] = useState('');

  function registrar(referencia, empresa, valor) {
    setMensagem('');
    const pagamento = servico.pagar(referencia, empresa, valor);
    setUltimo(pagamento);
    if (persistente) setAviso('');
    setMensagem('Simulação registrada com sucesso.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#conteudo" className="brand">
          <span className="brand-mark" aria-hidden="true">
            p.
          </span>
          <span>
            pagamentos<span className="brand-light"> / lab</span>
          </span>
        </a>
        <span className="study-label">
          <span aria-hidden="true" />
          Projeto de estudo · PGATS
        </span>
      </header>
      <main id="conteudo">
        <section className="intro" aria-labelledby="titulo">
          <p className="eyebrow">UM LABORATÓRIO DE QUALIDADE</p>
          <h1 id="titulo">
            Uma conta simples.
            <br />
            <span>Testes em cada camada.</span>
          </h1>
          <p className="intro-copy">
            Registre uma conta fictícia, confira a classificação e consulte o último registro. Um
            pequeno app para explorar testes automatizados na prática.
          </p>
          <div className="rule">
            <span className="rule-icon" aria-hidden="true">
              ≤
            </span>
            <p>
              Até <strong>R$ 100,00</strong>: padrão <span className="rule-divider">/</span> Acima:
              cara
            </p>
          </div>
        </section>
        {aviso && (
          <p className="alert warning" role="status">
            {aviso}
          </p>
        )}
        <div className="workspace">
          <section className="panel form-panel" aria-labelledby="novo-registro">
            <div className="panel-heading">
              <span className="step">01</span>
              <div>
                <h2 id="novo-registro">Nova simulação</h2>
                <p>Preencha os três campos para começar.</p>
              </div>
            </div>
            <FormularioPagamento onRegistrar={registrar} />
          </section>
          <section className="panel result-panel" aria-labelledby="ultimo-registro">
            <div className="panel-heading">
              <span className="step">02</span>
              <div>
                <h2 id="ultimo-registro">Último registro</h2>
                <p>O resultado da sua simulação.</p>
              </div>
            </div>
            <p className="success-message" role="status" aria-live="polite">
              {mensagem}
            </p>
            {ultimo ? (
              <div data-cy="ultimo-registro" className="receipt">
                <div className="receipt-top">
                  <span className="eyebrow">VALOR DA CONTA</span>
                  <span className={`badge ${ultimo.categoria === 'cara' ? 'expensive' : ''}`}>
                    {ultimo.categoria}
                  </span>
                </div>
                <p className="amount">{moeda.format(ultimo.valor)}</p>
                <dl>
                  <div>
                    <dt>Empresa</dt>
                    <dd>{ultimo.empresa}</dd>
                  </div>
                  <div>
                    <dt>Referência</dt>
                    <dd>{ultimo.codigoBarras}</dd>
                  </div>
                </dl>
                <p className="receipt-note">Registro local · Simulação sem transação</p>
              </div>
            ) : (
              <div className="empty-state" data-cy="sem-registro">
                <div className="empty-icon" aria-hidden="true">
                  ↗
                </div>
                <h3>Seu primeiro registro vem aqui</h3>
                <p>Faça uma simulação ao lado para visualizar os detalhes e a categoria.</p>
              </div>
            )}
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setUltimo(servico.consultarUltimoPagamento());
                setMensagem(
                  servico.consultarUltimoPagamento()
                    ? 'Último registro consultado.'
                    : 'Ainda não há registro para consultar.'
                );
              }}
            >
              Consultar último registro <span aria-hidden="true">↻</span>
            </button>
            <p className="storage-note">
              Com armazenamento disponível, o último registro fica neste navegador. Sem conta,
              servidor ou integração bancária.
            </p>
          </section>
        </div>
        <section className="layers" aria-label="Camadas de teste do projeto">
          <p className="eyebrow">QUALIDADE POR CAMADA</p>
          <div>
            <span>01 / Regras de negócio</span>
            <span>02 / Componentes React</span>
            <span>03 / Fluxos no navegador</span>
          </div>
        </section>
      </main>
      <footer>
        <span>Origem acadêmica preservada. Evolução para portfólio de QA.</span>
        <span>React · Mocha · Cypress</span>
      </footer>
    </div>
  );
}
