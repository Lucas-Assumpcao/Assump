const { Telegraf } = require('telegraf');
const { AIProjectClient } = require('@azure/ai-projects');
const { InteractiveBrowserCredential } = require('@azure/identity');

const TELEGRAM_BOT_TOKEN = '8599278307:AAFxKfKLzbLSgzdkJ6IBme6kRy1KE_LZygA';
const FOUNDRY_PROJECT_ENDPOINT = 'https://turismoia.services.ai.azure.com/api/projects/agencia-turismo';
const AGENT_NAME = 'TurismoIA';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const project = new AIProjectClient(
  FOUNDRY_PROJECT_ENDPOINT,
  new InteractiveBrowserCredential({
    redirectUri: 'http://localhost:8080',
  })
);

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

    const response = await openAIClient.responses.create({
      input: userMessage,
      conversation: conversationId,
      agent_reference: { name: AGENT_NAME, type: 'agent_reference' },
    });

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
    console.error('Erro:', err);
    await ctx.reply('Tive um erro ao processar sua mensagem. Tente novamente.');
  }
});

bot.launch();
console.log('Bot rodando em modo polling. Pressione Ctrl+C para parar.');