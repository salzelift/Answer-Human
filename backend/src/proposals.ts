import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "./utils/prisma";
import { AuthRequest, authenticate } from "./middleware/auth";
import { emitEvent } from "./realtime";
import { sendProposalEmail } from "./notifications";

interface Proposal {
  id: string;
  questionId: string;
  expertId: string;
  message: string;
  price: number;
  communicationMedium: string;
  estimatedDuration: string;
  createdAt: Date;
  updatedAt: Date;
}

const proposalsStore: Proposal[] = [];

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.query.questionId || "");

    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    const proposals = proposalsStore.filter((p) => p.questionId === questionId);
    res.json({ proposals });
  } catch (error: any) {
    console.error("Get proposals error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      questionId,
      expertId,
      message,
      price,
      communicationMedium,
      estimatedDuration,
    } = req.body;

    if (!questionId || !expertId || !message || !price || !communicationMedium || !estimatedDuration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const question = await prisma.questions.findUnique({
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

    const expert = await prisma.knowledgeProvider.findFirst({
      where: {
        OR: [{ id: expertId }, { userId: expertId }],
      },
      include: { user: true },
    });

    const proposal: Proposal = {
      id: uuidv4(),
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

    emitEvent("proposal:new", proposal, `question:${questionId}`);

    if (question.knowledgeSeeker.user?.email) {
      await sendProposalEmail({
        to: question.knowledgeSeeker.user.email,
        expertName: expert?.name || "An expert",
        questionTitle: question.questionTitle,
        message,
        price: Number(price),
        estimatedDuration,
      });
    }

    res.status(201).json({ proposal });
  } catch (error: any) {
    console.error("Create proposal error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;

