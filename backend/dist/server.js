"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const trackingSocket_1 = require("./sockets/trackingSocket");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// Create HTTP Server
const server = http_1.default.createServer(app_1.default);
// Bind Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// Initialize socket handlers
(0, trackingSocket_1.initTrackingSocket)(io);
// Start Server
server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`FoodBridge backend running on port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================`);
});
