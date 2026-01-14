import { Router, Response } from "express";
import prisma from "./utils/prisma";
import { authenticate, AuthRequest } from "./middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Submit provider onboarding application
router.post("/apply", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      websiteUrl,
      linkedinUrl,
      twitterUrl,
      githubUrl,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      profilePictureUrl,
      bannerPictureUrl,
      location,
      categoryIds,
      company,
      jobTitle,
      education,
      skills,
      interests,
      bio,
      availableDays,
      availableTimes,
      availableLanguages,
    } = req.body;

    // Validation
    if (!name || !bio) {
      return res.status(400).json({ error: "Name and bio are required" });
    }

    // Check if user is already a provider
    const existingProvider = await prisma.knowledgeProvider.findUnique({
      where: { userId: req.user!.userId },
    });

    if (existingProvider) {
      return res.status(400).json({ error: "You are already registered as an expert" });
    }

    // Validate and resolve categories (handle both IDs and slugs)
    let resolvedCategoryIds: string[] = [];
    if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: {
          OR: [
            { id: { in: categoryIds } },
            { slug: { in: categoryIds } },
          ],
        },
        select: {
          id: true,
          slug: true,
        },
      });

      if (existingCategories.length === 0) {
        return res.status(400).json({ 
          error: "No valid categories found. Please select categories and try again.",
          details: `Expected ${categoryIds.length} categories, found ${existingCategories.length}`,
        });
      }

      // Use the resolved IDs
      resolvedCategoryIds = existingCategories.map(cat => cat.id);
    }

    // Create provider profile
    const provider = await prisma.knowledgeProvider.create({
      data: {
        userId: req.user!.userId,
        name,
        description: description || null,
        websiteUrl: websiteUrl || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        githubUrl: githubUrl || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        youtubeUrl: youtubeUrl || null,
        tiktokUrl: tiktokUrl || null,
        profilePictureUrl: profilePictureUrl || null,
        bannerPictureUrl: bannerPictureUrl || null,
        location: location || null,
        company: company || null,
        jobTitle: jobTitle || null,
        education: education || null,
        skills: skills || [],
        interests: interests || [],
        bio,
        availableDays: availableDays || [],
        availableTimes: availableTimes || [],
        availableLanguages: availableLanguages || [],
        isAvailable: true,
        categories: resolvedCategoryIds.length > 0 ? {
          connect: resolvedCategoryIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        categories: true,
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

    // Update user role to KNOWLEDGE_PROVIDER
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { role: Role.KNOWLEDGE_PROVIDER },
    });

    res.status(201).json({
      message: "Expert application submitted successfully",
      provider,
    });
  } catch (error: any) {
    console.error("Provider onboarding error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Check if user can become an expert (not already one)
router.get("/check-eligibility", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const provider = await prisma.knowledgeProvider.findUnique({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        isVerified: true,
        verifiedAt: true,
      },
    });

    res.json({
      canBecomeExpert: !provider,
      isExpert: !!provider,
      isVerified: provider?.isVerified || false,
      verifiedAt: provider?.verifiedAt || null,
    });
  } catch (error: any) {
    console.error("Check eligibility error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get provider profile (for experts)
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const provider = await prisma.knowledgeProvider.findUnique({
      where: { userId: req.user!.userId },
      include: {
        categories: true,
        appointments: {
          include: {
            knowledgeSeeker: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePictureUrl: true,
              },
            },
            questions: true,
          },
          orderBy: {
            appointmentDate: "desc",
          },
        },
        questions: {
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
          orderBy: {
            createdAt: "desc",
          },
        },
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

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    res.json({ provider });
  } catch (error: any) {
    console.error("Get provider profile error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;

