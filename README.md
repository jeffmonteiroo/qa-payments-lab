# QA Payments Lab

Projeto de portfólio para praticar testes de regras de negócio, componentes React e fluxos completos no navegador. A aplicação registra contas fictícias, classifica o valor e permite consultar o último registro.

Nenhum pagamento é realizado. Use somente dados sintéticos: o projeto não valida boletos reais, não consulta APIs bancárias e não transmite os registros a um servidor.

## Origem

Projeto independente derivado do [laboratório PGATS](https://github.com/jeffmonteiroo/pgats-03-trabalho-conclusao-integracao-continua), na [versão 98abbfb](https://github.com/jeffmonteiroo/pgats-03-trabalho-conclusao-integracao-continua/tree/98abbfbb1220adbbca98816d9207d9b3cd8ac1fe). A origem é o trabalho da disciplina Integração Contínua para Automação de Testes, da pós-graduação PGATS. Foram preservados os cinco testes originais e a atribuição dos metadados. Esta cópia tem Git próprio e não substitui nem altera o trabalho da disciplina; não pressupõe avaliação pelo professor.

## Executar

Requisitos: Node.js 22.12+ na linha 22, ou Node.js 24, npm e os [pré-requisitos do Cypress](https://docs.cypress.io/app/get-started/install-cypress#System-requirements). O arquivo `.nvmrc` seleciona Node 22, também usado na CI.

```bash
nvm use                 # se você utiliza nvm
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. Para servir o build de produção:

```bash
npm run build
npm run preview
```

Abra `http://127.0.0.1:4173`. As portas são fixas. O Cypress baixa seu executável durante a instalação; se o download não for executado, use `npx cypress install`.

## Fluxo da aplicação

1. Preencha referência, empresa fictícia e valor.
2. Registre a simulação e confira a categoria.
3. Consulte o último registro e recarregue para verificar a persistência.
4. Tente um valor inválido e corrija sem perder os campos.

As regras são:

- Referência obrigatória, de 1 a 80 caracteres depois de remover espaços das extremidades. O nome `codigoBarras` foi preservado no domínio por compatibilidade com o exercício original; não representa validação bancária.
- Empresa obrigatória, de 1 a 100 caracteres depois de remover espaços das extremidades.
- Valor numérico finito, positivo, entre R$ 0,01 e R$ 999.999,99, representável em centavos.
- O formulário aceita vírgula ou ponto e até duas casas decimais, sem separador de milhares. Rejeita precisão extra, notação exponencial e texto misturado.
- R$ 99,99 e R$ 100,00 são classificados como padrão; R$ 100,01 é classificado como cara.
- Entradas inválidas não alteram o último registro. Sem registros, a consulta retorna `undefined`.

## Testes

| Camada | Cenários | Comando |
| --- | --- | --- |
| Mocha | Classificação, entradas inválidas, conversão e persistência com armazenamento fake; inclui os cinco testes originais | `npm test` |
| Relatório Mocha | Mesma suíte, com HTML e JSON Mochawesome | `npm run test:report` |
| Unitários Cypress | Chamadas diretas de funções e serviço, sem `cy.visit` ou `cy.mount` | `npm run test:cypress:unit` |
| Componentes Cypress | Montagem React, erros e foco, correção, teclado, falha de gravação e JSON corrompido | `npm run test:component` |
| E2E Cypress | Registrar, consultar e recarregar; rejeitar zero e corrigir para R$ 100,00 em viewport móvel | `npm run test:e2e` |
| Suítes completas | Mocha com relatório, três suítes Cypress e build | `npm run test:all` |

O script dos unitários Cypress usa `--e2e` com `cypress.unit.config.js` para iniciar o runner sem servidor de componentes. O escopo continua unitário: os testes importam o domínio e não abrem a aplicação. As fronteiras também são verificadas no Mocha para exercitar a mesma regra no Node e no navegador.

`npm run test:e2e` faz o build, inicia o preview local, aguarda HTTP 200 e encerra o servidor ao terminar. Não é necessário iniciá-lo manualmente. Para exploração interativa, use `npm run cypress:open`; no modo E2E, mantenha o preview ativo após o build.

Os testes usam dados fictícios. Cada E2E limpa somente a chave de armazenamento deste app. Não há esperas fixas com `cy.wait(tempo)` nem dependência de serviços externos ou Cypress Cloud. As tentativas automáticas estão desativadas.

## Organização e decisões

```text
src/servicoDePagamento.js          validação, classificação e serviço
src/repositorioLocal.js            adaptador localStorage versionado
src/valorDoFormulario.js           conversão do texto monetário
src/components/FormularioPagamento.jsx
src/App.jsx                       composição da interface e do serviço
test/                             testes Mocha
cypress/unit/                     funções e serviço sem UI
cypress/component/                componentes React montados com cy.mount
cypress/e2e/                      aplicação completa no navegador
.github/workflows/ci.yml
```

- As regras não dependem de React, DOM ou localStorage. O repositório é injetado; os testes Mocha usam um fake em memória.
- O serviço só altera a memória depois de salvar. Se a gravação falhar, o resultado anterior e os campos são mantidos para nova tentativa.
- Somente o último registro é persistido em `pgats.pagamentos.ultimo.v1`. O JSON tem versão, é revalidado e sua categoria é recalculada ao carregar.
- Um registro corrompido não é apagado ao abrir: a interface avisa que um novo registro válido poderá substituí-lo. Se o acesso ao armazenamento estiver indisponível, a sessão funciona em memória com aviso de que os dados não persistirão.
- Os valores usam `Number` validado na precisão de centavos; não são armazenados como inteiros em centavos e não há cálculos financeiros.
- A interface usa rótulos associados, mensagens com `aria-describedby`, alerta, foco no primeiro campo inválido e envio por teclado.

## Integração contínua e evidências

O [workflow](.github/workflows/ci.yml) está preparado para pull requests destinados à `main`, pushes na `main`, execução manual e agendamento diário às 00:00 UTC. O agendamento foi preservado do código de origem.

Há quatro jobs: Mocha e build; Cypress unitários; Cypress componentes; Cypress E2E. Eles usam `npm ci`, lockfile, Node definido em `.nvmrc`, permissões de conteúdo somente leitura, timeout e cancelamento de execuções antigas da mesma referência. O workflow não usa segredos nem faz deploy.

Os relatórios disponíveis são guardados por sete dias, inclusive após falha: Mochawesome HTML/JSON, JUnit e, quando produzidos, vídeos e screenshots Cypress. Confira os checks e os artefatos do commit em revisão antes de afirmar que a CI passou. Execuções do repositório de origem não constituem uma execução remota deste projeto independente.

## Limites

- É um laboratório de estudo e portfólio, sem alegação de experiência profissional ou sistema de produção.
- localStorage não é adequado para dados reais ou sensíveis. Limpar os dados remove o registro; não há histórico persistente completo, sincronização entre dispositivos ou atualização entre abas.
- Não há cobertura instrumentada, auditoria completa de segurança ou acessibilidade, teste de desempenho nem matriz completa de navegadores. Viewport móvel não equivale a aparelho físico.
- Componentes e E2E precisam do executável Cypress e das bibliotecas do sistema. Falhas de instalação ou execução devem ser registradas, sem presumir aprovação.
- As versões de Actions e a imagem `ubuntu-latest` foram preservadas da origem; sua atualização deve ser avaliada separadamente. O Electron usado por padrão no Cypress também possui aviso de depreciação.

## Revisão antes de integrar

- [ ] Explicar o limite inclusivo de R$ 100,00 e a validação monetária.
- [ ] Ler os testes e distinguir chamadas unitárias, montagem de componente e fluxo E2E.
- [ ] Demonstrar rejeição, correção e persistência após recarregar.
- [ ] Conferir o diff, os resultados e os artefatos do commit atual.
- [ ] Revisar teclado e responsividade, sem declarar acessibilidade completa.

Nenhuma revisão humana ou aprovação deve ser presumida pela existência dos testes.
