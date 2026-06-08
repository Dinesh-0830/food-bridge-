"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Standard middlewares
app.use((0, cors_1.default)({
    origin: '*', // Allow all in local dev/demo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' })); // Support larger base64 file uploads
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Mount all API routes
app.use('/api', routes_1.default);
// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the FoodBridge API Service!' });
});
// 404 Route handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error occurred:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
exports.default = app;
