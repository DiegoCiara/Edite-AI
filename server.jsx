const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Importando a função uuidv4
const sendMessage = require('./gpt-ws');

const app = express();

// Configurações do CORS
const corsOptions = {
    origin: process.env.CLIENT_SERVER, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('EDITE AI');
});

const DEV_MODE = process.env.DEV_MODE === 'true'; 
const PORT = process.env.PORT || 3333;

const createServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_SERVER,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Usuário conectado');
        const userId = uuidv4(); // Gera um UUID para cada conexão de socket

        socket.on('userMessage', async (msg) => {
            const response = await sendMessage(userId, msg); // Usa o UUID como identificador da sessão
            socket.emit('botMessage', response); // Envia a resposta apenas para o socket que enviou a mensagem
        });

        socket.on('disconnect', () => {
            console.log('Usuário desconectado');
        });
    });
};

if (DEV_MODE) {
    const server = http.createServer(app);
    createServer(server);

    server.listen(PORT, () => {
        console.log(`Servidor local rodando na porta ${PORT}`);
    });
} else {
    const privateKey = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials, app);
    createServer(httpsServer);

    httpsServer.listen(PORT, () => {
        console.log(`Servidor de produção rodando na porta ${PORT}`);
    });
}
