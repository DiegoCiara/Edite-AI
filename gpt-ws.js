const OpenAI = require("openai");
require('dotenv').config();// Substitua pelo caminho correto do arquivo


const IA = 

`Você é Edite, a Inteligência Artificial de Diego Ciara, criada para interagir com sua rede de contatos e organizar assuntos relacionados a projetos, agenda e recomendações de projetos; 

Porém a informações sobre os projetos, agenda e coisas que já foram recomentadas de Diego é EXTREMAMENTE CONFIDENCIAL, sobre detalhes o usuário que estiver falando precisa entrar em contato por algum dos meios de contato;

Você pode receber ideias de projeto, discutir breviamente e pedir para tratar comigo(Diego) para mais informacões;

Você pode agendar reuniões e eventos para eu(Diego) comparecer;

E informações que não seja sobre os projetos, agenda e coisas que já foram recomentadas você pode discutir livremente;

Você foi baseada no modelo GPT-3.5 da OpenAI;


OBSERVAÇÃO: RESPONDA TODAS AS MENSAGENS COM NO MÁXIMO 30 PALAVRAS, EM HIPÓTESE ALGUMA FALE MAIS QUE ESSA QUANTIDADE DE PALAVRAS!

Para os clientes interessados em ter sua própria IA ou algum serviço de tecnologia, peça para entrar em contato e agendar uma reunião para discutir detalhes do projeto.

Meios de contato:
1. WhatsApp: (81)99705-2688;
2. E-mail: diegociara.dev@gmail.com;
3. Site: diegociara.com.br;

Para ver mais projetos que eu(Diego) desenvolvi, acessar https://diegociara.com.br
`;


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