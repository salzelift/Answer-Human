"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("./utils/prisma"));
const auth_1 = require("./middleware/auth");
const realtime_1 = require("./realtime");
const notifications_1 = require("./notifications");
const proposalsStore = [];
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const questionId = String(req.query.questionId || "");
        if (!questionId) {
            return res.status(400).json({ error: "questionId is required" });
        }
        const proposals = proposalsStore.filter((p) => p.questionId === questionId);
        res.json({ proposals });
    }
    catch (error) {
        console.error("Get proposals error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { questionId, expertId, message, price, communicationMedium, estimatedDuration, } = req.body;
        if (!questionId || !expertId || !message || !price || !communicationMedium || !estimatedDuration) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const question = await prisma_1.default.questions.findUnique({
            where: { id: questionId },
            include: {
                knowledgeSeeker: {
                    include: { user: true },
                },
            },
        });
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }
        const expert = await prisma_1.default.knowledgeProvider.findFirst({
            where: {
                OR: [{ id: expertId }, { userId: expertId }],
            },
            include: { user: true },
        });
        const proposal = {
            id: (0, uuid_1.v4)(),
            questionId,
            expertId: expert?.id || expertId,
            message,
            price: Number(price),
            communicationMedium,
            estimatedDuration,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        proposalsStore.unshift(proposal);
        (0, realtime_1.emitEvent)("proposal:new", proposal, `question:${questionId}`);
        if (question.knowledgeSeeker.user?.email) {
            await (0, notifications_1.sendProposalEmail)({
                to: question.knowledgeSeeker.user.email,
                expertName: expert?.name || "An expert",
                questionTitle: question.questionTitle,
                message,
                price: Number(price),
                estimatedDuration,
            });
        }
        res.status(201).json({ proposal });
    }
    catch (error) {
        console.error("Create proposal error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
