require('dotenv').config();// Substitua pelo caminho correto do arquivo
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Função para listar todos os arquivos .txt em uma pasta
function getTextFilesFromDirectory(directoryPath) {
  return fs.readdirSync(directoryPath)
           .filter(file => path.extname(file).toLowerCase() === '.txt')
           .map(file => path.join(directoryPath, file));
}

// Caminho da pasta contendo os arquivos .txt
const directoryPath = './source';

// Obtém todos os arquivos .txt da pasta
const filePaths = getTextFilesFromDirectory(directoryPath);

// Concatena o conteúdo dos arquivos
const IA = filePaths.map(filePath => readTextFile(filePath)).join('\n');


const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Estrutura para armazenar o estado das conversas
let conversations = {};

async function sendMessage(userId, userMessage) {
  try {
    // Busca o histórico de mensagens para o usuário específico
    let userHistory = conversations[userId] || [];

    // Adiciona a nova mensagem do usuário ao histórico, se não for nula
    if (userMessage) {
      userHistory.push({
        role: "user",
        content: userMessage
      });
    }

    // Prepara as mensagens para a API, garantindo que todas têm conteúdo não nulo
    const messagesForAPI = userHistory.filter(msg => msg.content);

    // Adiciona a mensagem do sistema no início
    messagesForAPI.unshift({
      role: "system",
      content: IA
    });

    // Faz a requisição à API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesForAPI,
      temperature: 0.30,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Adiciona a resposta ao histórico
    userHistory.push(response.choices[0].message);

    // Atualiza o histórico na estrutura de conversas
    conversations[userId] = userHistory;

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro:", error);
  }
}


module.exports = sendMessage;