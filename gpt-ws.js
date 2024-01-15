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

async function sendMessage(userMensage) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: IA
        },
        {
          role: "user",
          content: userMensage
        },
      ],
      temperature: 0.30,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const mensage = response.choices[0].message.content;
    return mensage;
    // Exibindo a resposta no console
    // console.log("Resposta da API:", mensage);
  } catch (error) {
    console.error("Erro:", error);
  }
}

module.exports = sendMessage; // Exporta a função sem chamá-la
