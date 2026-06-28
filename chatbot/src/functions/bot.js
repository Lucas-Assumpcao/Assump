const { app } = require('@azure/functions');
const { Telegraf } = require('telegraf');
const { AIProjectClient } = require('@azure/ai-projects');
const { DefaultAzureCredential } = require('@azure/identity');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const project = new AIProjectClient(
  process.env.FOUNDRY_PROJECT_ENDPOINT,
  new DefaultAzureCredential()
);

const AGENT_NAME = process.env.FOUNDRY_AGENT_NAME;

// Guarda o ID da conversation de cada usuário do Telegram em memória
const userConversations = new Map();

async function getOrCreateConversation(chatId, openAIClient) {
  if (userConversations.has(chatId)) {
    return userConversations.get(chatId);
  }
  const conversation = await openAIClient.conversations.create();
  userConversations.set(chatId, conversation.id);
  return conversation.id;
}

bot.command('start', (ctx) => {
  ctx.reply('Olá! Sou o assistente conectado ao Azure AI Foundry 🤖');
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userMessage = ctx.message.text;

  try {
    await ctx.sendChatAction('typing');

    const openAIClient = await project.getOpenAIClient();
    const conversationId = await getOrCreateConversation(chatId, openAIClient);

    const response = await openAIClient.responses.create(
      {
        input: userMessage,
        conversation: conversationId,
      },
      {
        body: { agent: { name: AGENT_NAME, type: 'agent_reference' } },
      }
    );

    let respostaTexto = '';
    for (const item of response.output) {
      if (item.type === 'message') {
        for (const block of item.content) {
          if (block.text) respostaTexto += block.text;
        }
      }
    }

    await ctx.reply(respostaTexto || 'Não consegui gerar uma resposta.');
  } catch (err) {
    console.error(err);
    await ctx.reply('Tive um erro ao processar sua mensagem. Tente novamente.');
  }
});

app.http('bot', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      if (request.method === 'GET') {
        return { status: 200, body: 'Bot está no ar 🤖' };
      }

      const update = await request.json();
      await bot.handleUpdate(update);

      return { status: 200 };
    } catch (err) {
      context.error(err);
      return { status: 200 }; // sempre 200 pro Telegram não reenviar
    }
  },
});