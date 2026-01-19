"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedExpert = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware to check if expert is verified
const prisma_1 = __importDefault(require("../utils/prisma"));
const requireVerifiedExpert = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const provider = await prisma_1.default.knowledgeProvider.findUnique({
            where: { userId: req.user.userId },
            select: { isVerified: true },
        });
        if (!provider) {
            return res.status(403).json({ error: "Not an expert" });
        }
        if (!provider.isVerified) {
            return res.status(403).json({
                error: "Expert verification pending",
                message: "Your expert profile is under review. Please wait for verification."
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.requireVerifiedExpert = requireVerifiedExpert;
