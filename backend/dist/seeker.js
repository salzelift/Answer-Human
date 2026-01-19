"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./utils/prisma"));
const auth_1 = require("./middleware/auth");
const realtime_1 = require("./realtime");
// QuestionStatus enum - Will be available from @prisma/client after regeneration
var QuestionStatus;
(function (QuestionStatus) {
    QuestionStatus["PENDING"] = "PENDING";
    QuestionStatus["ANSWERED"] = "ANSWERED";
    QuestionStatus["CLOSED"] = "CLOSED";
})(QuestionStatus || (QuestionStatus = {}));
const router = (0, express_1.Router)();
// Get seeker profile
router.get("/profile", auth_1.authenticate, async (req, res) => {
    try {
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
                interestedCategories: true,
                appointments: {
                    include: {
                        knowledgeProvider: {
                            select: {
                                name: true,
                                profilePictureUrl: true,
                            },
                        },
                        questions: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        res.json({ seeker });
    }
    catch (error) {
        console.error("Get seeker profile error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Update seeker profile
router.put("/profile", auth_1.authenticate, async (req, res) => {
    try {
        const { name, email, phone, categoryIds, profilePictureUrl, 
        // Heuristic fields
        age, gender, occupation, educationLevel, experienceLevel, preferredCommunicationMedium, preferredPriceRange, preferredSessionDuration, preferredTimeSlots, preferredLanguages, budgetRange, urgencyLevel, learningStyle, preferredExpertRating, preferredResponseTime, preferredExpertLocation, timezone, devicePreferences, notificationPreferences, searchHistory, clickPatterns, } = req.body;
        const updateData = {};
        // Basic fields
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (phone)
            updateData.phone = phone;
        if (profilePictureUrl !== undefined)
            updateData.profilePictureUrl = profilePictureUrl;
        // Heuristic fields
        if (age !== undefined)
            updateData.age = age;
        if (gender !== undefined)
            updateData.gender = gender;
        if (occupation !== undefined)
            updateData.occupation = occupation;
        if (educationLevel !== undefined)
            updateData.educationLevel = educationLevel;
        if (experienceLevel !== undefined)
            updateData.experienceLevel = experienceLevel;
        if (preferredCommunicationMedium !== undefined)
            updateData.preferredCommunicationMedium = preferredCommunicationMedium;
        if (preferredPriceRange !== undefined)
            updateData.preferredPriceRange = preferredPriceRange;
        if (preferredSessionDuration !== undefined)
            updateData.preferredSessionDuration = preferredSessionDuration;
        if (preferredTimeSlots !== undefined)
            updateData.preferredTimeSlots = preferredTimeSlots;
        if (preferredLanguages !== undefined)
            updateData.preferredLanguages = preferredLanguages;
        if (budgetRange !== undefined)
            updateData.budgetRange = budgetRange;
        if (urgencyLevel !== undefined)
            updateData.urgencyLevel = urgencyLevel;
        if (learningStyle !== undefined)
            updateData.learningStyle = learningStyle;
        if (preferredExpertRating !== undefined)
            updateData.preferredExpertRating = preferredExpertRating;
        if (preferredResponseTime !== undefined)
            updateData.preferredResponseTime = preferredResponseTime;
        if (preferredExpertLocation !== undefined)
            updateData.preferredExpertLocation = preferredExpertLocation;
        if (timezone !== undefined)
            updateData.timezone = timezone;
        if (devicePreferences !== undefined)
            updateData.devicePreferences = devicePreferences;
        if (notificationPreferences !== undefined)
            updateData.notificationPreferences = notificationPreferences;
        if (searchHistory !== undefined)
            updateData.searchHistory = searchHistory;
        if (clickPatterns !== undefined)
            updateData.clickPatterns = clickPatterns;
        // Update lastActiveAt
        updateData.lastActiveAt = new Date();
        // Calculate profile completion score
        const completionFields = [
            name, email, phone, age, gender, occupation, educationLevel,
            experienceLevel, preferredCommunicationMedium, preferredPriceRange,
            preferredLanguages, budgetRange, learningStyle, timezone
        ];
        const completedFields = completionFields.filter(field => field !== undefined && field !== null && field !== "").length;
        const totalFields = completionFields.length;
        updateData.profileCompletionScore = Math.round((completedFields / totalFields) * 100);
        // Handle category connections
        if (categoryIds && Array.isArray(categoryIds)) {
            updateData.interestedCategories = {
                set: [],
                connect: categoryIds.map((id) => ({ id })),
            };
        }
        const seeker = await prisma_1.default.knowledgeSeeker.update({
            where: { userId: req.user.userId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
                interestedCategories: true,
            },
        });
        res.json({ message: "Profile updated successfully", seeker });
    }
    catch (error) {
        console.error("Update seeker profile error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Onboarding - Complete onboarding
router.post("/onboarding", auth_1.authenticate, async (req, res) => {
    try {
        const { name, phone, interestedCategories, profilePictureUrl } = req.body;
        // Validation
        if (!name || !phone) {
            return res.status(400).json({ error: "Name and phone are required" });
        }
        // Update seeker profile with onboarding data
        const seeker = await prisma_1.default.knowledgeSeeker.update({
            where: { userId: req.user.userId },
            data: {
                name,
                phone,
                interestedCategories: interestedCategories || [],
                profilePictureUrl: profilePictureUrl || null,
                isOnboarded: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        res.json({ message: "Onboarding completed successfully", seeker });
    }
    catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get onboarding status
router.get("/onboarding/status", auth_1.authenticate, async (req, res) => {
    try {
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
            select: {
                isOnboarded: true,
                name: true,
                phone: true,
                interestedCategories: true,
            },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        res.json({ isOnboarded: seeker.isOnboarded, profile: seeker });
    }
    catch (error) {
        console.error("Get onboarding status error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get all questions for the seeker
router.get("/questions", auth_1.authenticate, async (req, res) => {
    try {
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        const questions = await prisma_1.default.questions.findMany({
            where: { knowledgeSeekerId: seeker.id },
            orderBy: { createdAt: "desc" },
        });
        res.json({ questions });
    }
    catch (error) {
        console.error("Get questions error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get question by ID
router.get("/questions/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // First try to find question for seeker's own questions
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        // For experts viewing seeker questions, we need to include seeker info
        const question = await prisma_1.default.questions.findFirst({
            where: { id },
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
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }
        // If user is a seeker, verify they own this question OR they are a provider
        // For now, allow access for authenticated users
        res.json({ question });
    }
    catch (error) {
        console.error("Get question error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Create question
router.post("/questions", auth_1.authenticate, async (req, res) => {
    try {
        const { questionTitle, questionDescription, questionCategory, questionTags } = req.body;
        // Validation
        if (!questionTitle || !questionDescription || !questionCategory) {
            return res.status(400).json({
                error: "Question title, description, and category are required",
            });
        }
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        const question = await prisma_1.default.questions.create({
            data: {
                knowledgeSeekerId: seeker.id,
                questionTitle,
                questionDescription,
                questionCategory,
                questionTags: questionTags || [],
                questionStatus: QuestionStatus.PENDING,
            },
        });
        (0, realtime_1.emitEvent)("question:new", question);
        const categoryRoom = question.questionCategory
            ? `category:${question.questionCategory.toLowerCase()}`
            : null;
        if (categoryRoom) {
            (0, realtime_1.emitEvent)("question:new", question, categoryRoom);
        }
        if (Array.isArray(question.questionTags)) {
            question.questionTags
                .filter((tag) => typeof tag === "string" && tag.trim())
                .forEach((tag) => {
                (0, realtime_1.emitEvent)("question:new", question, `tag:${tag.toLowerCase()}`);
            });
        }
        res.status(201).json({ message: "Question created successfully", question });
    }
    catch (error) {
        console.error("Create question error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Update question
router.put("/questions/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { questionTitle, questionDescription, questionCategory, questionTags, questionStatus } = req.body;
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        // Check if question belongs to seeker
        const existingQuestion = await prisma_1.default.questions.findFirst({
            where: {
                id,
                knowledgeSeekerId: seeker.id,
            },
        });
        if (!existingQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }
        const question = await prisma_1.default.questions.update({
            where: { id },
            data: {
                ...(questionTitle && { questionTitle }),
                ...(questionDescription && { questionDescription }),
                ...(questionCategory && { questionCategory }),
                ...(questionTags && { questionTags }),
                ...(questionStatus && { questionStatus }),
            },
        });
        (0, realtime_1.emitEvent)("question:update", question, `question:${id}`);
        const categoryRoom = question.questionCategory
            ? `category:${question.questionCategory.toLowerCase()}`
            : null;
        if (categoryRoom) {
            (0, realtime_1.emitEvent)("question:update", question, categoryRoom);
        }
        if (Array.isArray(question.questionTags)) {
            question.questionTags
                .filter((tag) => typeof tag === "string" && tag.trim())
                .forEach((tag) => {
                (0, realtime_1.emitEvent)("question:update", question, `tag:${tag.toLowerCase()}`);
            });
        }
        res.json({ message: "Question updated successfully", question });
    }
    catch (error) {
        console.error("Update question error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Delete question
router.delete("/questions/:id", auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        // Check if question belongs to seeker
        const existingQuestion = await prisma_1.default.questions.findFirst({
            where: {
                id,
                knowledgeSeekerId: seeker.id,
            },
        });
        if (!existingQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }
        await prisma_1.default.questions.delete({
            where: { id },
        });
        res.json({ message: "Question deleted successfully" });
    }
    catch (error) {
        console.error("Delete question error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
