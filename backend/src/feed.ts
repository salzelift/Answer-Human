import { Router, Response } from "express";
import prisma from "./utils/prisma";
import { AuthRequest, authenticate, requireRole } from "./middleware/auth";

const router = Router();

router.get(
  "/expert",
  authenticate,
  requireRole(["KNOWLEDGE_PROVIDER"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const provider = await prisma.knowledgeProvider.findUnique({
        where: { userId: req.user!.userId },
        include: { categories: true },
      });

      if (!provider) {
        return res.status(404).json({ error: "Expert profile not found" });
      }

      const categoryNames = provider.categories.map((cat) => cat.name.toLowerCase());
      const skillMatches = provider.skills.map((skill) => skill.toLowerCase());
      const interestMatches = provider.interests.map((interest) => interest.toLowerCase());

      const questions = await prisma.questions.findMany({
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
        const tagMatch =
          tags.some((tag) => skillMatches.includes(tag)) ||
          tags.some((tag) => interestMatches.includes(tag));

        return categoryMatch || tagMatch;
      });

      res.json({ questions: filtered });
    } catch (error: any) {
      console.error("Expert feed error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
);

export default router;

