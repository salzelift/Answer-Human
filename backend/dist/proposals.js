"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./utils/prisma"));
const auth_1 = require("./middleware/auth");
const realtime_1 = require("./realtime");
const notifications_1 = require("./notifications");
const router = (0, express_1.Router)();
// Get proposals for a question
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const questionId = String(req.query.questionId || "");
        if (!questionId) {
            return res.status(400).json({ error: "questionId is required" });
        }
        const proposals = await prisma_1.default.proposal.findMany({
            where: { questionId },
            include: {
                expert: {
                    select: {
                        id: true,
                        name: true,
                        profilePictureUrl: true,
                        jobTitle: true,
                        company: true,
                        location: true,
                        skills: true,
                        bio: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Transform proposals to match expected format
        const formattedProposals = proposals.map((p) => ({
            id: p.id,
            questionId: p.questionId,
            expertId: p.expertId,
            message: p.message,
            price: Number(p.price),
            communicationMedium: p.communicationMedium,
            estimatedDuration: p.estimatedDuration,
            status: p.status,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            expert: p.expert,
        }));
        res.json({ proposals: formattedProposals });
    }
    catch (error) {
        console.error("Get proposals error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Create a new proposal
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
        // Find the expert
        const expert = await prisma_1.default.knowledgeProvider.findFirst({
            where: {
                OR: [{ id: expertId }, { userId: expertId }],
            },
            include: { user: true },
        });
        if (!expert) {
            return res.status(404).json({ error: "Expert not found" });
        }
        // Check if expert already submitted a proposal for this question
        const existingProposal = await prisma_1.default.proposal.findFirst({
            where: {
                questionId,
                expertId: expert.id,
            },
        });
        if (existingProposal) {
            return res.status(400).json({ error: "You have already submitted a proposal for this question" });
        }
        // Create proposal in database
        const proposal = await prisma_1.default.proposal.create({
            data: {
                questionId,
                expertId: expert.id,
                message,
                price: Number(price),
                communicationMedium,
                estimatedDuration,
            },
            include: {
                expert: {
                    select: {
                        id: true,
                        name: true,
                        profilePictureUrl: true,
                        jobTitle: true,
                        company: true,
                        location: true,
                        skills: true,
                        bio: true,
                    },
                },
            },
        });
        // Format proposal for response
        const formattedProposal = {
            id: proposal.id,
            questionId: proposal.questionId,
            expertId: proposal.expertId,
            message: proposal.message,
            price: Number(proposal.price),
            communicationMedium: proposal.communicationMedium,
            estimatedDuration: proposal.estimatedDuration,
            status: proposal.status,
            createdAt: proposal.createdAt,
            updatedAt: proposal.updatedAt,
            expert: proposal.expert,
        };
        // Emit real-time event
        (0, realtime_1.emitEvent)("proposal:new", formattedProposal, `question:${questionId}`);
        // Send email notification
        if (question.knowledgeSeeker.user?.email) {
            await (0, notifications_1.sendProposalEmail)({
                to: question.knowledgeSeeker.user.email,
                expertName: expert.name || "An expert",
                questionTitle: question.questionTitle,
                message,
                price: Number(price),
                estimatedDuration,
            });
        }
        res.status(201).json({ proposal: formattedProposal });
    }
    catch (error) {
        console.error("Create proposal error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Update proposal status (accept/reject)
router.put("/:id/status", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be ACCEPTED or REJECTED" });
        }
        const proposal = await prisma_1.default.proposal.findUnique({
            where: { id },
            include: { question: true },
        });
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        // Verify the user owns the question
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker || proposal.question.knowledgeSeekerId !== seeker.id) {
            return res.status(403).json({ error: "You can only update proposals for your own questions" });
        }
        const updatedProposal = await prisma_1.default.proposal.update({
            where: { id },
            data: { status },
        });
        // If accepted, update question status
        if (status === "ACCEPTED") {
            await prisma_1.default.questions.update({
                where: { id: proposal.questionId },
                data: {
                    questionStatus: "ANSWERED",
                    knowledgeProviderId: proposal.expertId,
                },
            });
        }
        res.json({ proposal: updatedProposal });
    }
    catch (error) {
        console.error("Update proposal status error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
