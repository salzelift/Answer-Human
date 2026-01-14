import { Router, Response } from "express";
import { Request } from "express";
import { authenticate, AuthRequest } from "./middleware/auth";
import prisma from "./utils/prisma";

const router = Router();

// Helper function to build hierarchical category structure
function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
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
router.get("/", async (req: Request, res: Response) => {
  try {
    // Fetch all categories from database
    const allCategories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Build hierarchical structure
    const categories = buildCategoryTree(allCategories);

    res.json({ categories });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get category by ID or slug
router.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    // Try to find by ID first, then by slug
    const category = await prisma.category.findFirst({
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
  } catch (error: any) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;

