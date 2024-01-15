
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require("socket.io");
const cors = require('cors');
const sendMessage = require('./gpt-ws'); // Substitua pelo caminho correto do arquivo

const app = express();

// Configurações do CORS
const corsOptions = {
    origin: process.env.CLIENT_SERVER, // Substitua com a URL do seu cliente React
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

if(DEV_MODE){
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    io.on('connection', (socket) => {
        console.log('Usuário conectado');
    
        socket.on('userMessage', async (msg) => {
            const response = await sendMessage(msg);
            io.emit('botMessage', response); 
        });
    
        socket.on('disconnect', () => {
            console.log('Usuário desconectado');
        });
    });
    
    server.listen(PORT, () => {
        console.log(`Servidor local rodando na porta ${PORT}`);
    });
} else {
    const privateKey = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8');

    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);

    const io = new Server(httpsServer, {
    cors: {
        origin: process.env.CLIENT_SERVER, // Substitua com a URL do seu cliente React
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
    httpsServer.listen(PORT, () => {
        console.log(`Servidor de produção rodando na porta ${PORT}`);
    });
}