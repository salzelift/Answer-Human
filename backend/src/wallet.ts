import { Router, Response } from "express";
import prisma from "./utils/prisma";
import { authenticate, AuthRequest, requireRole } from "./middleware/auth";

const router = Router();

// Get wallet balance and details
router.get(
  "/",
  authenticate,
  requireRole(["KNOWLEDGE_PROVIDER"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const provider = await prisma.knowledgeProvider.findUnique({
        where: { userId: req.user!.userId },
        include: {
          wallet: {
            include: {
              bankDetails: true,
            },
          },
        },
      });

      if (!provider) {
        return res.status(404).json({ error: "Expert profile not found" });
      }

      // Create wallet if it doesn't exist
      let wallet = provider.wallet;
      if (!wallet) {
        wallet = await prisma.expertWallet.create({
          data: {
            expertId: provider.id,
            balance: 0,
            currency: "INR",
          },
          include: {
            bankDetails: true,
          },
        });
      }

      res.json({
        wallet: {
          id: wallet.id,
          balance: Number(wallet.balance),
          currency: wallet.currency,
          hasBankDetails: !!wallet.bankDetails,
          bankDetails: wallet.bankDetails
            ? {
                accountHolderName: wallet.bankDetails.accountHolderName,
                accountNumber: `****${wallet.bankDetails.accountNumber.slice(-4)}`,
                bankName: wallet.bankDetails.bankName,
                ifscCode: wallet.bankDetails.ifscCode,
              }
            : null,
        },
      });
    } catch (error: any) {
      console.error("Get wallet error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
);

// Get wallet transactions
router.get(
  "/transactions",
  authenticate,
  requireRole(["KNOWLEDGE_PROVIDER"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = "1", limit = "20", type } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const provider = await prisma.knowledgeProvider.findUnique({
        where: { userId: req.user!.userId },
        include: { wallet: true },
      });

      if (!provider) {
        return res.status(404).json({ error: "Expert profile not found" });
      }

      if (!provider.wallet) {
        return res.json({ transactions: [], total: 0, page: pageNum, limit: limitNum });
      }

      const whereClause: any = { walletId: provider.wallet.id };
      if (type && (type === "CREDIT" || type === "PAYOUT")) {
        whereClause.type = type;
      }

      const [transactions, total] = await Promise.all([
        prisma.walletTransaction.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.walletTransaction.count({ where: whereClause }),
      ]);

      res.json({
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          description: t.description,
          razorpayPaymentId: t.razorpayPaymentId,
          razorpayPayoutId: t.razorpayPayoutId,
          appointmentId: t.appointmentId,
          createdAt: t.createdAt,
        })),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
);

// Add or update bank details
router.post(
  "/bank-details",
  authenticate,
  requireRole(["KNOWLEDGE_PROVIDER"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

      // Validation
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        return res.status(400).json({ error: "All bank details are required" });
      }

      const provider = await prisma.knowledgeProvider.findUnique({
        where: { userId: req.user!.userId },
        include: { wallet: { include: { bankDetails: true } } },
      });

      if (!provider) {
        return res.status(404).json({ error: "Expert profile not found" });
      }

      // Create wallet if it doesn't exist
      let walletId = provider.wallet?.id;
      let existingBankDetails = provider.wallet?.bankDetails;
      
      if (!walletId) {
        const newWallet = await prisma.expertWallet.create({
          data: {
            expertId: provider.id,
            balance: 0,
            currency: "INR",
          },
        });
        walletId = newWallet.id;
      }

      // Update or create bank details
      let bankDetails;
      if (existingBankDetails) {
        bankDetails = await prisma.expertBankDetails.update({
          where: { walletId },
          data: {
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
          },
        });
      } else {
        bankDetails = await prisma.expertBankDetails.create({
          data: {
            walletId,
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
          },
        });
      }

      res.json({
        message: "Bank details saved successfully",
        bankDetails: {
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
          bankName: bankDetails.bankName,
          ifscCode: bankDetails.ifscCode,
        },
      });
    } catch (error: any) {
      console.error("Save bank details error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
);

// Get payout summary
router.get(
  "/payout-summary",
  authenticate,
  requireRole(["KNOWLEDGE_PROVIDER"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const provider = await prisma.knowledgeProvider.findUnique({
        where: { userId: req.user!.userId },
        include: { wallet: true },
      });

      if (!provider) {
        return res.status(404).json({ error: "Expert profile not found" });
      }

      if (!provider.wallet) {
        return res.json({
          currentBalance: 0,
          totalEarnings: 0,
          totalPayouts: 0,
          pendingPayouts: 0,
        });
      }

      // Calculate totals from transactions
      const transactions = await prisma.walletTransaction.findMany({
        where: { walletId: provider.wallet.id },
      });

      const totalEarnings = transactions
        .filter((t) => t.type === "CREDIT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalPayouts = transactions
        .filter((t) => t.type === "PAYOUT" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pendingPayouts = transactions
        .filter((t) => t.type === "PAYOUT" && t.status === "PENDING")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      res.json({
        currentBalance: Number(provider.wallet.balance),
        totalEarnings,
        totalPayouts,
        pendingPayouts,
        currency: provider.wallet.currency,
      });
    } catch (error: any) {
      console.error("Get payout summary error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
);

export default router;

