import { Router, Response } from "express";
import prisma from "./utils/prisma";
import { AuthRequest, authenticate } from "./middleware/auth";
import { emitEvent } from "./realtime";
import { sendProposalEmail } from "./notifications";

const router = Router();

// Get proposals for a question
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const questionId = String(req.query.questionId || "");

    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    const proposals = await prisma.proposal.findMany({
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
  } catch (error: any) {
    console.error("Get proposals error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Create a new proposal
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

    // Find the expert
    const expert = await prisma.knowledgeProvider.findFirst({
      where: {
        OR: [{ id: expertId }, { userId: expertId }],
      },
      include: { user: true },
    });

    if (!expert) {
      return res.status(404).json({ error: "Expert not found" });
    }

    // Check if expert already submitted a proposal for this question
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        questionId,
        expertId: expert.id,
      },
    });

    if (existingProposal) {
      return res.status(400).json({ error: "You have already submitted a proposal for this question" });
    }

    // Create proposal in database
    const proposal = await prisma.proposal.create({
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
    emitEvent("proposal:new", formattedProposal, `question:${questionId}`);

    // Send email notification
    if (question.knowledgeSeeker.user?.email) {
      await sendProposalEmail({
        to: question.knowledgeSeeker.user.email,
        expertName: expert.name || "An expert",
        questionTitle: question.questionTitle,
        message,
        price: Number(price),
        estimatedDuration,
      });
    }

    res.status(201).json({ proposal: formattedProposal });
  } catch (error: any) {
    console.error("Create proposal error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update proposal status (accept/reject)
router.put("/:id/status", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be ACCEPTED or REJECTED" });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { question: true },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // Verify the user owns the question
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker || proposal.question.knowledgeSeekerId !== seeker.id) {
      return res.status(403).json({ error: "You can only update proposals for your own questions" });
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: { status },
    });

    // If accepted, update question status
    if (status === "ACCEPTED") {
      await prisma.questions.update({
        where: { id: proposal.questionId },
        data: { 
          questionStatus: "ANSWERED",
          knowledgeProviderId: proposal.expertId,
        },
      });
    }

    res.json({ proposal: updatedProposal });
  } catch (error: any) {
    console.error("Update proposal status error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;

