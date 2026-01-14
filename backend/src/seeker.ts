import { Router, Response } from "express";
import { Request } from "express";
import prisma from "./utils/prisma";
import { authenticate, AuthRequest } from "./middleware/auth";
// QuestionStatus enum - Will be available from @prisma/client after regeneration
enum QuestionStatus {
  PENDING = "PENDING",
  ANSWERED = "ANSWERED",
  CLOSED = "CLOSED",
}

const router = Router();

// Get seeker profile
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
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
  } catch (error: any) {
    console.error("Get seeker profile error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update seeker profile
router.put("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      categoryIds,
      profilePictureUrl,
      // Heuristic fields
      age,
      gender,
      occupation,
      educationLevel,
      experienceLevel,
      preferredCommunicationMedium,
      preferredPriceRange,
      preferredSessionDuration,
      preferredTimeSlots,
      preferredLanguages,
      budgetRange,
      urgencyLevel,
      learningStyle,
      preferredExpertRating,
      preferredResponseTime,
      preferredExpertLocation,
      timezone,
      devicePreferences,
      notificationPreferences,
      searchHistory,
      clickPatterns,
    } = req.body;

    const updateData: any = {};
    
    // Basic fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;
    
    // Heuristic fields
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (educationLevel !== undefined) updateData.educationLevel = educationLevel;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (preferredCommunicationMedium !== undefined) updateData.preferredCommunicationMedium = preferredCommunicationMedium;
    if (preferredPriceRange !== undefined) updateData.preferredPriceRange = preferredPriceRange;
    if (preferredSessionDuration !== undefined) updateData.preferredSessionDuration = preferredSessionDuration;
    if (preferredTimeSlots !== undefined) updateData.preferredTimeSlots = preferredTimeSlots;
    if (preferredLanguages !== undefined) updateData.preferredLanguages = preferredLanguages;
    if (budgetRange !== undefined) updateData.budgetRange = budgetRange;
    if (urgencyLevel !== undefined) updateData.urgencyLevel = urgencyLevel;
    if (learningStyle !== undefined) updateData.learningStyle = learningStyle;
    if (preferredExpertRating !== undefined) updateData.preferredExpertRating = preferredExpertRating;
    if (preferredResponseTime !== undefined) updateData.preferredResponseTime = preferredResponseTime;
    if (preferredExpertLocation !== undefined) updateData.preferredExpertLocation = preferredExpertLocation;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (devicePreferences !== undefined) updateData.devicePreferences = devicePreferences;
    if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;
    if (searchHistory !== undefined) updateData.searchHistory = searchHistory;
    if (clickPatterns !== undefined) updateData.clickPatterns = clickPatterns;
    
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
        connect: categoryIds.map((id: string) => ({ id })),
      };
    }

    const seeker = await prisma.knowledgeSeeker.update({
      where: { userId: req.user!.userId },
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
  } catch (error: any) {
    console.error("Update seeker profile error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Onboarding - Complete onboarding
router.post("/onboarding", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, interestedCategories, profilePictureUrl } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    // Update seeker profile with onboarding data
    const seeker = await prisma.knowledgeSeeker.update({
      where: { userId: req.user!.userId },
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
  } catch (error: any) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get onboarding status
router.get("/onboarding/status", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
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
  } catch (error: any) {
    console.error("Get onboarding status error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get all questions for the seeker
router.get("/questions", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    const questions = await prisma.questions.findMany({
      where: { knowledgeSeekerId: seeker.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ questions });
  } catch (error: any) {
    console.error("Get questions error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get question by ID
router.get("/questions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    const question = await prisma.questions.findFirst({
      where: {
        id,
        knowledgeSeekerId: seeker.id,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({ question });
  } catch (error: any) {
    console.error("Get question error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Create question
router.post("/questions", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionTitle, questionDescription, questionCategory, questionTags } = req.body;

    // Validation
    if (!questionTitle || !questionDescription || !questionCategory) {
      return res.status(400).json({
        error: "Question title, description, and category are required",
      });
    }

    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    const question = await prisma.questions.create({
      data: {
        knowledgeSeekerId: seeker.id,
        questionTitle,
        questionDescription,
        questionCategory,
        questionTags: questionTags || [],
        questionStatus: QuestionStatus.PENDING,
      },
    });

    res.status(201).json({ message: "Question created successfully", question });
  } catch (error: any) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update question
router.put("/questions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionTitle, questionDescription, questionCategory, questionTags, questionStatus } =
      req.body;

    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    // Check if question belongs to seeker
    const existingQuestion = await prisma.questions.findFirst({
      where: {
        id,
        knowledgeSeekerId: seeker.id,
      },
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    const question = await prisma.questions.update({
      where: { id },
      data: {
        ...(questionTitle && { questionTitle }),
        ...(questionDescription && { questionDescription }),
        ...(questionCategory && { questionCategory }),
        ...(questionTags && { questionTags }),
        ...(questionStatus && { questionStatus }),
      },
    });

    res.json({ message: "Question updated successfully", question });
  } catch (error: any) {
    console.error("Update question error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Delete question
router.delete("/questions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    // Check if question belongs to seeker
    const existingQuestion = await prisma.questions.findFirst({
      where: {
        id,
        knowledgeSeekerId: seeker.id,
      },
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    await prisma.questions.delete({
      where: { id },
    });

    res.json({ message: "Question deleted successfully" });
  } catch (error: any) {
    console.error("Delete question error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;

