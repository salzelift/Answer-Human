"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("./utils/prisma"));
const router = (0, express_1.Router)();
// Helper function to build hierarchical category structure
function buildCategoryTree(categories, parentId = null) {
    return categories
        .filter((cat) => cat.parentCategoryId === parentId)
        .map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        slug: cat.slug,
        parentCategoryId: cat.parentCategoryId,
        subCategories: buildCategoryTree(categories, cat.id),
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
    }));
}
// Get all categories (hierarchical structure)
router.get("/", async (req, res) => {
    try {
        // Fetch all categories from database
        const allCategories = await prisma_1.default.category.findMany({
            orderBy: {
                name: "asc",
            },
        });
        // Build hierarchical structure
        const categories = buildCategoryTree(allCategories);
        res.json({ categories });
    }
    catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
// Get category by ID or slug
router.get("/:identifier", async (req, res) => {
    try {
        const { identifier } = req.params;
        // Try to find by ID first, then by slug
        const category = await prisma_1.default.category.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { slug: identifier },
                ],
            },
            include: {
                subCategories: {
                    include: {
                        subCategories: {
                            include: {
                                subCategories: true,
                            },
                        },
                    },
                },
            },
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ category });
    }
    catch (error) {
        console.error("Get category error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});
exports.default = router;
