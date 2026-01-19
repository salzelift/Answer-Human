"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./utils/prisma"));
const router = (0, express_1.Router)();
// Helper function to get all category IDs including parents for hierarchical filtering
// When filtering by "logo-design", also match experts with "graphic-design" or "design"
async function getCategoryIdsWithParents(categoryIdentifiers) {
    const categoryIds = new Set();
    // First, find all matching categories (by ID or slug)
    const categories = await prisma_1.default.category.findMany({
        where: {
            OR: [
                { id: { in: categoryIdentifiers } },
                { slug: { in: categoryIdentifiers } },
            ],
        },
        select: { id: true, parentCategoryId: true },
    });
    // For each matched category, add it and traverse up to collect all parent IDs
    for (const category of categories) {
        categoryIds.add(category.id);
        // Traverse up the parent chain
        let currentCategoryId = category.parentCategoryId;
        while (currentCategoryId) {
            categoryIds.add(currentCategoryId);
            const parent = await prisma_1.default.category.findUnique({
                where: { id: currentCategoryId },
                select: { id: true, parentCategoryId: true },
            });
            if (parent) {
                currentCategoryId = parent.parentCategoryId;
            }
            else {
                break;
            }
        }
    }
    return Array.from(categoryIds);
}
// Get all experts with filtering (public endpoint)
router.get("/", async (req, res) => {
    try {
        const { q, // search query
        categories, // comma-separated category IDs or slugs
        sort = "relevance", // relevance, rating, price, reviews (default: relevance)
        sortDirection = "desc", // asc, desc
        connect, // video, audio, chat (communication medium)
        timeSlot, // optional time slot filter
         } = req.query;
        // Build where clause
        const where = {
            isAvailable: true, // Only show available experts
        };
        // Build array of conditions to combine with AND
        const andConditions = [];
        // Search query filter (name, description, skills, interests, bio)
        if (q && typeof q === "string") {
            const searchTerm = q.trim();
            if (searchTerm) {
                andConditions.push({
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { description: { contains: searchTerm, mode: "insensitive" } },
                        { bio: { contains: searchTerm, mode: "insensitive" } },
                        { skills: { hasSome: [searchTerm] } },
                        { interests: { hasSome: [searchTerm] } },
                    ],
                });
            }
        }
        // Category filter using many-to-many relation with hierarchical support
        if (categories && typeof categories === "string") {
            const categoryList = categories.split(",").filter(Boolean);
            if (categoryList.length > 0) {
                // Get all category IDs including parents for hierarchical matching
                // This allows filtering by "logo-design" to also match experts with "graphic-design" or "design"
                const categoryIdsWithParents = await getCategoryIdsWithParents(categoryList);
                if (categoryIdsWithParents.length > 0) {
                    andConditions.push({
                        categories: {
                            some: {
                                id: {
                                    in: categoryIdsWithParents,
                                },
                            },
                        },
                    });
                }
            }
        }
        // Combine all conditions with AND if we have additional conditions
        if (andConditions.length > 0) {
            where.AND = andConditions;
        }
        // Build orderBy clause
        let orderBy = {};
        switch (sort) {
            case "rating":
                // Since we don't have rating field, sort by createdAt
                orderBy = { createdAt: sortDirection === "asc" ? "asc" : "desc" };
                break;
            case "price":
                // Since we don't have price field, sort by createdAt
                orderBy = { createdAt: sortDirection === "asc" ? "asc" : "desc" };
                break;
            case "reviews":
                // Since we don't have reviews field, sort by createdAt
                orderBy = { createdAt: sortDirection === "asc" ? "asc" : "desc" };
                break;
            case "relevance":
            default:
                // Relevance: sort by createdAt (newest first)
                orderBy = { createdAt: "desc" };
                break;
        }
        const experts = await prisma_1.default.knowledgeProvider.findMany({
            where,
            orderBy,
            include: {
                categories: true, // Include categories in response
            },
        });
        // Apply connect type filter (if needed, can filter by availableLanguages, availableDays, etc.)
        let filteredExperts = experts;
        if (connect && typeof connect === "string") {
            // This is a basic filter - in a real app, you might want to filter by available communication mediums
            // For now, we'll just return all experts
            // You could extend this to filter based on availableLanguages or other criteria
        }
        res.json({ experts: filteredExperts, count: filteredExperts.length });
    }
    catch (error) {
        console.error("Get experts error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get expert by ID (public endpoint)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Looking for expert with ID: ${id}`);
        const expert = await prisma_1.default.knowledgeProvider.findUnique({
            where: { id },
            include: {
                categories: true, // Include categories in response
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        if (!expert) {
            // Try to find by userId in case the wrong ID was passed
            const expertByUserId = await prisma_1.default.knowledgeProvider.findUnique({
                where: { userId: id },
                include: {
                    categories: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            if (expertByUserId) {
                console.log(`Found expert by userId instead of providerId`);
                return res.json({ expert: expertByUserId });
            }
            console.log(`Expert not found with ID: ${id}`);
            return res.status(404).json({
                error: "Expert not found",
                providedId: id,
                hint: "Make sure you're using the KnowledgeProvider ID, not the User ID"
            });
        }
        res.json({ expert });
    }
    catch (error) {
        console.error("Get expert error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
