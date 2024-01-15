
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode'); // Use 'qrcode' em vez de 'qrcode-terminal'
const sendMessage = require('./gpt-ws'); // Importe a função do arquivo correto

const app = express();
const server = http.createServer(app);
const client = new Client();


let qrCodeDataURL = ''; // Variável para armazenar o QR Code


const io = socketIo(server, {
  cors: {
    origin: "*", // Isso permite todas as origens. Para maior segurança, configure as origens permitidas.
    methods: ["GET", "POST"]
  }
});
client.on('qr', (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
      if (err) {
          console.error('Erro ao gerar QR code', err);
          return;
      }
      qrCodeDataURL = url; // Armazena o QR Code como URL de dados
      io.emit('qr', url);
  });

});

app.get('/', (req, res) => {
  // Envia o QR Code como resposta, ou uma mensagem se não estiver disponível
  if (qrCodeDataURL) {
    res.send(`<img src="${qrCodeDataURL}" alt="QR Code">`); // Envia o QR Code como imagem
  } else {
    res.send('QR Code não disponível. Aguarde a inicialização do cliente.');
  }
});


client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready');
});

client.on('message', msg => {
    sendMessage(msg.body)
      .then(response => {
          msg.reply(response);
      })
      .catch(error => {
          console.error("Erro ao enviar mensagem:", error);
          msg.reply('Desculpe, não pude entender sua mensagem.');
      });
});


client.on('disconnected', (reason) => {
  console.log('WhatsApp desconectado!', reason);
  io.emit('qr', ''); // Emita um valor vazio ou uma mensagem para indicar a desconexão no frontend
  client.initialize(); // Reinicializa o cliente para começar uma nova sessão e gerar um novo QR code
});

client.initialize();



io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);
  socket.on('disconnect', () => {
      console.log('Cliente desconectado', socket.id);
  });
});

server.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});


//Há um erro quando finaliza a sessão no WhatsApp precisa corrigir