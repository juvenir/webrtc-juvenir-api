const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log(socket.id, 'Connected');
  // Enviar o ID numérico para o cliente assim que se conectar
  socket.emit('id', { id: socket.handshake.query.callerId });

  socket.on('makeCall', (data) => {
    const { calleeId, sdpOffer } = data;
    socket.to(calleeId).emit('newCall', { callerId: socket.id, sdpOffer });
  });

  socket.on('answerCall', (data) => {
    const { callerId, sdpAnswer } = data;
    socket.to(callerId).emit('callAnswered', { callee: socket.id, sdpAnswer });
  });

  socket.on('IceCandidate', (data) => {
    const { calleeId, iceCandidate } = data;
    socket.to(calleeId).emit('IceCandidate', { sender: socket.id, iceCandidate });
  });

  socket.on('disconnect', () => {
    console.log(socket.id, 'Disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor de sinais rodando em http://localhost:${PORT}`);
});
