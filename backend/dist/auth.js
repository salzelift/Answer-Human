"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const jwt_1 = require("./utils/jwt");
const client_1 = require("@prisma/client");
const auth_1 = require("./middleware/auth");
const resend_1 = require("./utils/resend");
const router = (0, express_1.Router)();
// OTP expiration time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;
// Helper function to create and send OTP
async function createAndSendOTP(userId, email, type) {
    try {
        // Delete any existing unused OTPs of the same type for this user
        await prisma_1.default.oTP.deleteMany({
            where: {
                userId,
                type,
                isUsed: false,
            },
        });
        // Generate new OTP
        const otpCode = (0, resend_1.generateOTP)();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        // Save OTP to database
        await prisma_1.default.oTP.create({
            data: {
                userId,
                code: otpCode,
                type,
                expiresAt,
            },
        });
        // Send email
        const purpose = type === client_1.OTPType.EMAIL_VERIFICATION ? "verification" : "password-reset";
        const subject = type === client_1.OTPType.EMAIL_VERIFICATION
            ? "Verify Your Email - Answer Human"
            : "Reset Your Password - Answer Human";
        const emailSent = await (0, resend_1.sendEmail)({
            to: email,
            subject,
            html: (0, resend_1.getOTPEmailTemplate)(otpCode, purpose),
        });
        return emailSent;
    }
    catch (error) {
        console.error("Error creating/sending OTP:", error);
        return false;
    }
}
// Helper function to verify OTP
async function verifyOTPCode(userId, code, type) {
    const otp = await prisma_1.default.oTP.findFirst({
        where: {
            userId,
            type,
            isUsed: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (!otp) {
        return { valid: false, error: "No OTP found. Please request a new one." };
    }
    if (new Date() > otp.expiresAt) {
        return { valid: false, error: "OTP has expired. Please request a new one." };
    }
    if (otp.code !== code) {
        return { valid: false, error: "Invalid OTP. Please try again." };
    }
    // Mark OTP as used
    await prisma_1.default.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
    });
    return { valid: true };
}
// Step 1: Initiate Registration (send OTP)
router.post("/register/initiate", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        // Check if user exists
        const existingUserByEmail = await prisma_1.default.user.findUnique({
            where: { email },
        });
        const existingUserByUsername = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (existingUserByEmail) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        if (existingUserByUsername) {
            return res.status(400).json({ error: "Username is already taken" });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with unverified email
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: client_1.Role.KNOWLEDGE_SEEKER,
                isEmailVerified: false,
            },
        });
        // Send OTP
        const otpSent = await createAndSendOTP(user.id, email, client_1.OTPType.EMAIL_VERIFICATION);
        if (!otpSent) {
            // Delete the user if we couldn't send the OTP
            await prisma_1.default.user.delete({ where: { id: user.id } });
            return res.status(500).json({ error: "Failed to send verification email. Please try again." });
        }
        res.status(201).json({
            message: "Verification code sent to your email",
            userId: user.id,
            email: user.email,
        });
    }
    catch (error) {
        console.error("Registration initiate error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Step 2: Verify OTP and complete registration
router.post("/register/verify", async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ error: "User ID and OTP are required" });
        }
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }
        // Verify OTP
        const verification = await verifyOTPCode(userId, otp, client_1.OTPType.EMAIL_VERIFICATION);
        if (!verification.valid) {
            return res.status(400).json({ error: verification.error });
        }
        // Mark email as verified
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        });
        // Create KnowledgeSeeker profile
        await prisma_1.default.knowledgeSeeker.create({
            data: {
                userId: user.id,
                name: user.username,
                email: user.email,
                phone: "",
                isOnboarded: false,
            },
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({
            message: "Email verified successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isEmailVerified: true,
            },
        });
    }
    catch (error) {
        console.error("Registration verify error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Resend OTP for registration
router.post("/register/resend-otp", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ error: "Email is already verified" });
        }
        const otpSent = await createAndSendOTP(user.id, user.email, client_1.OTPType.EMAIL_VERIFICATION);
        if (!otpSent) {
            return res.status(500).json({ error: "Failed to send verification email. Please try again." });
        }
        res.json({ message: "Verification code resent successfully" });
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Legacy Register (without OTP - for backwards compatibility, can be removed later)
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        // Check if user exists
        const existingUserByEmail = await prisma_1.default.user.findUnique({
            where: { email },
        });
        const existingUserByUsername = await prisma_1.default.user.findUnique({
            where: { username },
        });
        const existingUser = existingUserByEmail || existingUserByUsername;
        if (existingUser) {
            return res.status(400).json({ error: "User with this email or username already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const userRole = role || client_1.Role.KNOWLEDGE_SEEKER;
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: userRole,
                isEmailVerified: true, // Skip verification for legacy endpoint
            },
        });
        // Create KnowledgeSeeker if role is KNOWLEDGE_SEEKER
        if (userRole === client_1.Role.KNOWLEDGE_SEEKER) {
            await prisma_1.default.knowledgeSeeker.create({
                data: {
                    userId: user.id,
                    name: username,
                    email: email,
                    phone: "",
                    isOnboarded: false,
                },
            });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: {
                knowledgeSeeker: true,
                knowledgeProvider: true,
            },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                error: "Email not verified",
                requiresVerification: true,
                userId: user.id,
            });
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isOnboarded: user.knowledgeSeeker?.isOnboarded || false,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Forgot Password - Step 1: Request reset
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        // Always return success message to prevent email enumeration
        if (!user) {
            return res.json({
                message: "If an account with this email exists, a password reset code has been sent."
            });
        }
        const otpSent = await createAndSendOTP(user.id, email, client_1.OTPType.PASSWORD_RESET);
        if (!otpSent) {
            return res.status(500).json({ error: "Failed to send reset email. Please try again." });
        }
        res.json({
            message: "If an account with this email exists, a password reset code has been sent.",
            userId: user.id, // Return userId for the next step
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Forgot Password - Step 2: Verify OTP
router.post("/forgot-password/verify", async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ error: "User ID and OTP are required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const verification = await verifyOTPCode(userId, otp, client_1.OTPType.PASSWORD_RESET);
        if (!verification.valid) {
            return res.status(400).json({ error: verification.error });
        }
        // Generate a temporary token for password reset
        const resetToken = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({
            message: "OTP verified successfully",
            resetToken,
        });
    }
    catch (error) {
        console.error("Verify reset OTP error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Forgot Password - Step 3: Reset password
router.post("/reset-password", async (req, res) => {
    try {
        const { userId, newPassword, resetToken } = req.body;
        if (!userId || !newPassword) {
            return res.status(400).json({ error: "User ID and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Send confirmation email
        await (0, resend_1.sendEmail)({
            to: user.email,
            subject: "Password Reset Successful - Answer Human",
            html: (0, resend_1.getPasswordResetSuccessTemplate)(),
        });
        res.json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Resend OTP for password reset
router.post("/forgot-password/resend-otp", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const otpSent = await createAndSendOTP(user.id, user.email, client_1.OTPType.PASSWORD_RESET);
        if (!otpSent) {
            return res.status(500).json({ error: "Failed to send reset email. Please try again." });
        }
        res.json({ message: "Reset code resent successfully" });
    }
    catch (error) {
        console.error("Resend reset OTP error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get current user
router.get("/me", auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                knowledgeSeeker: true,
                knowledgeProvider: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            user: {
                ...user,
                isOnboarded: user.knowledgeSeeker?.isOnboarded || false,
            },
        });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
