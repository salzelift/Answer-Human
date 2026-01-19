"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const detailsMiddleware_1 = __importDefault(require("./utils/detailsMiddleware"));
const auth_1 = __importDefault(require("./auth"));
const category_1 = __importDefault(require("./category"));
const seeker_1 = __importDefault(require("./seeker"));
const provider_1 = __importDefault(require("./provider"));
const appointment_1 = __importDefault(require("./appointment"));
const providerOnboarding_1 = __importDefault(require("./providerOnboarding"));
const feed_1 = __importDefault(require("./feed"));
const proposals_1 = __importDefault(require("./proposals"));
const razorpay_1 = __importDefault(require("./razorpay"));
const wallet_1 = __importDefault(require("./wallet"));
const linkedin_1 = __importDefault(require("./linkedin"));
const ai_1 = __importDefault(require("./ai"));
const realtime_1 = require("./realtime");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(detailsMiddleware_1.default);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Answer Human Server is Healthy and running" });
});
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/categories", category_1.default);
app.use("/api/seeker", seeker_1.default);
app.use("/api/providers", provider_1.default);
app.use("/api/appointments", appointment_1.default);
app.use("/api/provider-onboarding", providerOnboarding_1.default);
app.use("/api/feed", feed_1.default);
app.use("/api/proposals", proposals_1.default);
app.use("/api/payments", razorpay_1.default);
app.use("/api/wallet", wallet_1.default);
app.use("/api/linkedin", linkedin_1.default);
app.use("/api/ai", ai_1.default);
const PORT = process.env.PORT || 8000;
(0, realtime_1.initSocket)(server);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
