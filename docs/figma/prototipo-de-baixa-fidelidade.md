# Documentação de Design — Protótipo de Baixa Fidelidade (Wireframes)

Aqui, consolidamos os conceitos básicos e a arquitetura de informação da aplicação. O protótipo de baixa fidelidade (Wireframes) serve como uma visão inicial da disposição dos elementos na tela do **Feedback Analytics**, focando na usabilidade e nos fluxos principais antes da aplicação do estilo visual definitivo.

---

## 1. Home (Página Inicial)

Visão estrutural inicial do que será a página de apresentação comercial do projeto. O foco aqui é o mapeamento de conteúdo e hierarquia da informação para conversão.

| Elementos Estruturais | Objetivo no Wireframe |
| :--- | :--- |
| **Bloco Hero** | Marcação para título principal forte (H1) e um esqueleto para as imagens. |
| **Bloco Como funciona?** | Card e imagem explicando o funcionamento do projeto de forma simples |
| **Grid de Benefícios** | Caixas simples com imagens demarcando onde os pontos fortes da plataforma serão explicados. |
| **Bloco de CTA** |     |


---

## 2. Coleta de Feedbacks

Visão inicial da página pública de captura de dados. Como é a página que o cliente final acessa, o wireframe foi pensado com uma estrutura minimalista (Mobile-First).

| Elementos Estruturais | Objetivo no Wireframe |
| :--- | :--- |
| **Identificação da Empresa** | Espaço no topo reservado para o nome ou logotipo da empresa que está sendo avaliada. |
| **Componente de Nota** | Placeholder para a seleção de 1 a 5 estrelas. |
| **Seleção de Sentimento** | Caixas ou botões de rádio (Radio buttons) indicando as opções emocionais (Péssimo a Ótimo). |
| **Área de Comentário** | Caixa de texto ampla (Textarea) simulada para o cliente escrever o feedback. |
| **Botão de Envio** | Bloco de CTA primário no final do formulário. |

---

## 3. Dashboard

Visão inicial do painel de controle administrativo. O wireframe foca em definir a grade (Grid) e onde cada métrica principal deve ser alocada para melhor leitura do gestor.

| Elementos Estruturais | Objetivo no Wireframe |
| :--- | :--- |
| **Sidebar / Menu Lateral** | Marcação dos links de navegação interna (Dashboard, Perfil, QR Codes, etc). |
| **Linha de KPIs (Cards)** | 4 blocos retangulares no topo alinhados horizontalmente para os indicadores-chave (Total, Média, etc). |
| **Gráficos (Placeholders)** | Quadrados com ícones de "imagem" ou gráficos em blocos indicando onde o Radar de Satisfação será renderizado. |
| **Feedbacks Recentes** | Uma tabela simples ou lista de blocos mostrando os últimos comentários recebidos. |

---

## 4. Perfil do Usuário

Tela de edição e gerenciamento das informações do usuário e da empresa em sua versão conceitual.

| Elementos Estruturais | Objetivo no Wireframe |
| :--- | :--- |
| **Avatar e Identificação** | Um círculo representando a foto de perfil ao lado do nome do usuário. |
| **Grupos de Formulário** | Blocos de `inputs` separados por título (Dados Pessoais vs. Dados da Empresa). |
| **Configuração de IA** | Um campo de texto maior rascunhado para a inserção dos objetivos de análise de inteligência artificial. |
| **Ações de Formulário** | Botões de "Salvar" e "Cancelar" ao final das seções de edição. |

---

## 5. Gerenciamento de QR Code

Visão inicial da tela onde o usuário criará e administrará as origens de coleta (QR Codes).

| Elementos Estruturais | Objetivo no Wireframe |
| :--- | :--- |
| **Header de Ações** | Um botão principal de "Novo QR Code" ou categorias em formato de abas (Tabs). |
| **Lista/Grid de QR Codes** | Cartões rascunhados exibindo o nome do ponto de coleta, a imagem simulada do QR Code e seu status. |
| **Controles de Ação** | Ícones básicos (Engrenagem, Download, Lixeira) ao lado de cada QR Code na lista. |