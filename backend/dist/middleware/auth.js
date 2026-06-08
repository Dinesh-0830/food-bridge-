"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApproval = exports.restrictTo = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_foodbridge_key_123!';
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication token missing or invalid' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, status: true }
        });
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const requireApproval = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    // Admin doesn't need approval, others must be APPROVED
    if (user.role !== 'ADMIN' && user.status !== 'APPROVED') {
        return res.status(403).json({ message: 'Your account is pending administrator approval' });
    }
    next();
};
exports.requireApproval = requireApproval;
