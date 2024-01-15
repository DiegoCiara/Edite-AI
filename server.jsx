const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require("socket.io");
const cors = require('cors');
const sendMessage = require('./gpt-ws'); // Substitua pelo caminho correto do arquivo

const app = express();

// Configurações do CORS
const corsOptions = {
    origin: 'https://localhost:5173', // Substitua com a URL do seu cliente React
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Carregando chave privada e certificado
const privateKey = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Criando servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Configuração do Socket.IO com CORS
const io = new Server(httpsServer, {
  cors: {
    origin: "https://localhost:5173", // Substitua com a URL do seu cliente React
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
    console.log('Usuário conectado');

    socket.on('userMessage', async (msg) => {
        const response = await sendMessage(msg);
        io.emit('botMessage', response); // Envia a resposta para todos os clientes conectados
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
