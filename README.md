# Feedback Analytics Projeto Integrador (PI)
Este projeto oferece um canal estruturado para a coleta e análise de feedbacks. Destinado a empresas de pequeno e médio porte, o Feedback Analytics propõe uma solução para a tomada de decisões baseada em dados de opiniões de clientes reais.       
Acesse o [mapeamento de personas](https://www.notion.so/Sobre-o-projeto-Entenda-25600a4f151281abb0fbc17daabae506?source=copy_link) para saber mais. 
      
## Arquitetura e Stack
Este sistema está estruturado em uma arquitetura Single Page Application(SPA), com uma API Sidecar (BFF - Backend for Frontend), implantada em um ambiente Serverless. [Veja mais detalhes sobre a arquitetura](https://www.notion.so/Arquitetura-Inicial-25600a4f151281619875ef9e5c29b159?source=copy_link).

Para o padrao de servicos externos por impacto (dominio compartilhado x dominio dedicado), consulte services/README.md.

Deploy em Vercel segue configuracao por dominio:
- apps/web/vercel.json
- backends/api-gateway/vercel.json
- services/ia-analyze/vercel.json

### Tech Stack
- Cliente (React App):
    - React 19, Vite, TypeScript.
- Servidor API (Express.js):
    - Node.js, Express 5.
- Supabase (Backend-as-a-Service):
    - PostgreSQL.
- Google Gemini API:
    - API REST externa.
 

*Entenda melhor o [funcionamento](https://www.notion.so/Desenvolvimento-do-Software-25600a4f1512817da199d57263d4279c?source=copy_link) do sistema.*
      
## Execute o Código
**Requisitos**

- Node  instalado na versão 22.16.0
- Gerenciador de pacotes NPM instalado na versão 10.9.2
- IDE instalada qualquer uma  que lide com HTML, CSS, JS, JSX, TS, TSX ( Recomendação VSCode )


**Passos**

- Clone o projeto
- No terminal dentro da pasta do projeto execute `npm install`
- Ainda no terminal dentro da pasta do projeto execute:
    - `npm run dev` para executar somente o front end
    - `npm run server:dev` para executar somente o back end
    - `npm run dev:all` para executar o front e back
