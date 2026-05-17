# UC-10: Listagem e Filtragem de Feedbacks

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Navegar pelo histórico de feedbacks, aplicar filtros e visualizar os detalhes de cada avaliação |
| **Gatilho** | Gestor acessa a seção de feedbacks no dashboard |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa a listagem de feedbacks.
2. O sistema carrega em paralelo os feedbacks paginados e as estatísticas gerais (exibidas no cabeçalho da página).
3. O gestor aplica um ou mais filtros opcionais:
   - **Busca por mensagem** — texto livre com debounce de 450ms.
   - **Nota** — seleciona uma nota de 1 a 5 estrelas.
   - **Categoria** — filtra por tipo de ponto de coleta: Empresa, Produto, Serviço ou Departamento.
   - **Item de catálogo** — texto livre para buscar por nome do produto, serviço ou departamento; também com debounce de 450ms.
   - **Itens por página** — seleciona entre 5, 10, 20 ou 50 itens (padrão: 10).
4. A lista é atualizada com os feedbacks que correspondem aos filtros aplicados. A navegação entre páginas é feita pela paginação na base da lista.
5. O gestor clica em um feedback para abrir o modal de detalhes, que exibe:
   - **Cabeçalho:** nota, data de criação e data de atualização (quando disponível).
   - **Mensagem completa** do cliente (sem truncamento).
   - **Ponto de Coleta:** canal, tipo, identificador, categoria (Empresa/Produto/Serviço/Departamento) e nome do item.
   - **Perguntas Dinâmicas:** até 3 respostas com o texto da pergunta e o label da resposta.
   - **Dispositivo:** fingerprint, total de feedbacks enviados pelo dispositivo, IP, user agent e status de bloqueio.
   - **Cliente:** nome, e-mail e gênero (quando o cliente forneceu dados pessoais).
6. O gestor fecha o modal e continua navegando pela lista.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Nenhum feedback encontrado com os filtros aplicados | Exibe empty state com mensagem de ajuste de filtros |
| Empresa sem nenhum feedback ainda | Exibe empty state com mensagem indicando que nenhum feedback foi recebido |
| Erro no carregamento da lista | Substitui a página por uma mensagem de erro centralizada — sem botão de tentar novamente |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.

**Cenários a cobrir:**

- **Caminho feliz:** gestor acessa a lista, vê feedbacks paginados e clica em um para abrir o modal de detalhes com todas as seções (ponto de coleta, perguntas, dispositivo, cliente).
- **Caminho feliz — filtro por nota:** selecionar nota 5 deve exibir apenas feedbacks com aquela avaliação.
- **Caminho feliz — filtro por categoria:** selecionar "Produto" deve exibir apenas feedbacks de pontos de coleta do tipo produto.
- **Caminho feliz — busca textual:** digitar um termo deve filtrar feedbacks que contenham aquele texto na mensagem (com debounce de ~450ms antes da requisição).
- **Caminho feliz — filtro por item:** digitar um nome de item deve filtrar feedbacks daquele produto/serviço/departamento.
- **Caminho feliz — paginação:** mudar de página deve carregar o próximo conjunto de feedbacks mantendo os filtros ativos.
- **Exceção — filtro sem resultado:** aplicar filtro que não retorna feedbacks deve exibir o empty state de "ajuste os filtros".
- **Exceção — sem feedbacks:** empresa sem histórico deve exibir o empty state de "nenhum feedback recebido".
