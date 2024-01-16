require('dotenv').config();// Substitua pelo caminho correto do arquivo
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

function readTextFile(filePath) {
  return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}

function getTextFilesFromDirectory(directoryPath) {
  return fs.readdirSync(path.join(__dirname, directoryPath))
           .filter(file => path.extname(file).toLowerCase() === '.txt')
           .map(file => path.join(directoryPath, file));
}

const directoryPath = './source';

const filePaths = getTextFilesFromDirectory(directoryPath);
const IA = filePaths.map(filePath => readTextFile(filePath)).join('\n');

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

let conversations = {};

async function sendMessage(userId, userMessage) {
  try {
    let userHistory = conversations[userId] || [];

    if (userMessage) {
      userHistory.push({
        role: "user",
        content: userMessage
      });
    }

    const messagesForAPI = userHistory.filter(msg => msg.content);

    messagesForAPI.unshift({
      role: "system",
      content: IA
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesForAPI,
      temperature: 0.30,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    userHistory.push(response.choices[0].message);

    conversations[userId] = userHistory;

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro:", error);
  }
}


module.exports = sendMessage;