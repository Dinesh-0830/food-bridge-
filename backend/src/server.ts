import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initTrackingSocket } from './sockets/trackingSocket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Bind Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
initTrackingSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`FoodBridge backend running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
