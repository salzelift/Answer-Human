"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./utils/prisma"));
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
router.get("/expert", auth_1.authenticate, (0, auth_1.requireRole)(["KNOWLEDGE_PROVIDER"]), async (req, res) => {
    try {
        const provider = await prisma_1.default.knowledgeProvider.findUnique({
            where: { userId: req.user.userId },
            include: { categories: true },
        });
        if (!provider) {
            return res.status(404).json({ error: "Expert profile not found" });
        }
        const categoryNames = provider.categories.map((cat) => cat.name.toLowerCase());
        const skillMatches = provider.skills.map((skill) => skill.toLowerCase());
        const interestMatches = provider.interests.map((interest) => interest.toLowerCase());
        const questions = await prisma_1.default.questions.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                knowledgeSeeker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        const filtered = questions.filter((question) => {
            const category = question.questionCategory.toLowerCase();
            const tags = question.questionTags.map((tag) => tag.toLowerCase());
            const categoryMatch = categoryNames.includes(category);
            const tagMatch = tags.some((tag) => skillMatches.includes(tag)) ||
                tags.some((tag) => interestMatches.includes(tag));
            return categoryMatch || tagMatch;
        });
        res.json({ questions: filtered });
    }
    catch (error) {
        console.error("Expert feed error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
