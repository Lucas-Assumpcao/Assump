# 🤖 Chatbot Telegram + Azure AI Foundry

Bot do Telegram que conversa com um **Agent** criado no **Azure AI Foundry (Agent Service)**, usando Node.js e a biblioteca [Telegraf.js](https://telegraf.js.org/).

## Como funciona

```
Telegram (usuário) → Script Node.js (polling) → Azure AI Foundry Agent → resposta → Telegram
```

O bot roda localmente em modo **polling** (sem necessidade de webhook, ngrok ou hospedagem na nuvem). Cada usuário do Telegram tem sua própria _conversation_ no Foundry, preservando o contexto entre mensagens.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (18+)
- Uma conta no [Telegram](https://telegram.org/) com um bot criado via [@BotFather](https://t.me/BotFather)
- Um projeto no [Azure AI Foundry](https://ai.azure.com/) com um **Agent** já criado
- Permissão de acesso (RBAC) ao recurso do Foundry com a role **Azure AI User** (ou equivalente)

## Instalação

```bash
npm install telegraf @azure/ai-projects @azure/identity
```

## Configuração

Edite as constantes no topo do arquivo `src/index.js`:

```javascript
const TELEGRAM_BOT_TOKEN = "SEU_TOKEN_DO_BOTFATHER";
const FOUNDRY_PROJECT_ENDPOINT =
  "https://SEU-PROJETO.services.ai.azure.com/api/projects/SEU-PROJETO";
const AGENT_NAME = "nome-do-seu-agent";
```

> ⚠️ **Atenção**: por simplicidade, este projeto define essas credenciais diretamente no código. Para uso real ou repositórios públicos, mova-as para variáveis de ambiente (`.env`) e adicione o arquivo ao `.gitignore`.

## Executando

```bash
node src/index.js
```

Na primeira mensagem recebida, uma janela do navegador será aberta para login na sua conta Azure (via `InteractiveBrowserCredential`). Após o login, o bot responde normalmente às mensagens do Telegram.

```
Bot rodando em modo polling. Pressione Ctrl+C para parar.
```

Abra o Telegram, procure pelo seu bot e envie `/start` ou qualquer mensagem de texto.

## Estrutura do projeto

```
chatbot/
├── src/
│   └── index.js        # código principal do bot
├── package.json
└── README.md
```

## Tecnologias utilizadas

| Tecnologia                                                             | Função                                      |
| ---------------------------------------------------------------------- | ------------------------------------------- |
| [Telegraf.js](https://telegraf.js.org/)                                | Integração com a API do Telegram            |
| [@azure/ai-projects](https://www.npmjs.com/package/@azure/ai-projects) | SDK para o Azure AI Foundry / Agent Service |
| [@azure/identity](https://www.npmjs.com/package/@azure/identity)       | Autenticação na Azure (Microsoft Entra ID)  |

## Limitações conhecidas

- O bot só responde enquanto o script estiver em execução (sem hospedagem em nuvem).
- O histórico de conversas é mantido apenas em memória — é perdido ao reiniciar o script.
- A autenticação interativa exige login manual periódico, não sendo adequada para produção contínua.

## Possíveis evoluções

- [ ] Migrar para Azure Functions / App Service com webhook, para hospedagem 24/7
- [ ] Usar Managed Identity em vez de login interativo
- [ ] Mover credenciais para variáveis de ambiente
- [ ] Persistir o histórico de conversas em um banco de dados (Azure Cosmos DB, Table Storage, etc.)

## Documentação completa

Para o relato detalhado de todo o processo de desenvolvimento, decisões técnicas e problemas resolvidos, veja [`Documentacao_Projeto_Chatbot_Telegram_AzureAI.docx`](./Documentacao_Projeto_Chatbot_Telegram_AzureAI.docx).
