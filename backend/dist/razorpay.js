"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
// Create a payment order
router.post("/create-order", auth_1.authenticate, async (req, res) => {
    try {
        const { amount, currency = "INR", appointmentId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Valid amount is required" });
        }
        if (!appointmentId) {
            return res.status(400).json({ error: "Appointment ID is required" });
        }
        // Verify the appointment exists and belongs to the user
        const seeker = await prisma_1.default.knowledgeSeeker.findUnique({
            where: { userId: req.user.userId },
        });
        if (!seeker) {
            return res.status(404).json({ error: "Seeker profile not found" });
        }
        const appointment = await prisma_1.default.appointment.findFirst({
            where: {
                id: appointmentId,
                knowledgeSeekerId: seeker.id,
            },
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${appointmentId}_${Date.now()}`,
            notes: {
                appointmentId,
                seekerId: seeker.id,
            },
        };
        const order = await razorpay.orders.create(options);
        // Update appointment with order info
        await prisma_1.default.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentTransactionId: order.id,
                paymentTransactionStatus: "CREATED",
            },
        });
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    }
    catch (error) {
        console.error("Create Razorpay order error:", error);
        res.status(500).json({ error: "Failed to create payment order", details: error.message });
    }
});
// Verify payment and complete transaction
router.post("/verify-payment", auth_1.authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId, } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing payment verification details" });
        }
        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");
        const isAuthentic = expectedSignature === razorpay_signature;
        if (!isAuthentic) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }
        // Get appointment and update payment status
        const appointment = await prisma_1.default.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                knowledgeProvider: true,
            },
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        // Update appointment payment status
        const updatedAppointment = await prisma_1.default.appointment.update({
            where: { id: appointmentId },
            data: {
                paymentStatus: "PAID",
                appointmentStatus: "CONFIRMED",
                paymentTransactionId: razorpay_payment_id,
                paymentTransactionStatus: "COMPLETED",
            },
        });
        // Credit amount to expert wallet
        const expertId = appointment.knowledgeProviderId;
        const amount = appointment.totalPaymemnt;
        // Find or create expert wallet
        let wallet = await prisma_1.default.expertWallet.findUnique({
            where: { expertId },
        });
        if (!wallet) {
            wallet = await prisma_1.default.expertWallet.create({
                data: {
                    expertId,
                    balance: 0,
                    currency: "INR",
                },
            });
        }
        // Update wallet balance and create transaction
        await prisma_1.default.$transaction([
            prisma_1.default.expertWallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            }),
            prisma_1.default.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: "CREDIT",
                    amount: amount,
                    currency: "INR",
                    status: "COMPLETED",
                    razorpayPaymentId: razorpay_payment_id,
                    appointmentId: appointmentId,
                    description: `Payment for appointment #${appointmentId.slice(0, 8)}`,
                },
            }),
        ]);
        res.json({
            success: true,
            message: "Payment verified and appointment confirmed",
            appointment: updatedAppointment,
        });
    }
    catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ error: "Failed to verify payment", details: error.message });
    }
});
// Webhook for Razorpay events
router.post("/webhook", async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
        const signature = req.headers["x-razorpay-signature"];
        // Verify webhook signature
        const expectedSignature = crypto_1.default
            .createHmac("sha256", webhookSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (signature !== expectedSignature) {
            console.log("Invalid webhook signature");
            return res.status(400).json({ error: "Invalid signature" });
        }
        const event = req.body.event;
        const payload = req.body.payload;
        console.log(`Received Razorpay webhook: ${event}`);
        switch (event) {
            case "payment.captured":
                // Payment was successful
                const paymentId = payload.payment.entity.id;
                const orderId = payload.payment.entity.order_id;
                // Find appointment by order ID and update status
                const appointment = await prisma_1.default.appointment.findFirst({
                    where: { paymentTransactionId: orderId },
                });
                if (appointment) {
                    await prisma_1.default.appointment.update({
                        where: { id: appointment.id },
                        data: {
                            paymentStatus: "PAID",
                            appointmentStatus: "CONFIRMED",
                            paymentTransactionId: paymentId,
                            paymentTransactionStatus: "CAPTURED",
                        },
                    });
                }
                break;
            case "payment.failed":
                // Payment failed
                const failedOrderId = payload.payment.entity.order_id;
                const failedAppointment = await prisma_1.default.appointment.findFirst({
                    where: { paymentTransactionId: failedOrderId },
                });
                if (failedAppointment) {
                    await prisma_1.default.appointment.update({
                        where: { id: failedAppointment.id },
                        data: {
                            paymentStatus: "FAILED",
                            paymentTransactionStatus: "FAILED",
                            paymentTransactionError: payload.payment.entity.error_description,
                        },
                    });
                }
                break;
            case "refund.created":
                // Handle refund
                console.log("Refund created:", payload.refund.entity);
                break;
            default:
                console.log(`Unhandled webhook event: ${event}`);
        }
        res.json({ status: "ok" });
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
});
// Request payout for expert (transfer to bank)
router.post("/request-payout", auth_1.authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Valid amount is required" });
        }
        // Get expert and wallet
        const provider = await prisma_1.default.knowledgeProvider.findUnique({
            where: { userId: req.user.userId },
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
        if (!provider.wallet) {
            return res.status(400).json({ error: "Wallet not found" });
        }
        if (!provider.wallet.bankDetails) {
            return res.status(400).json({ error: "Please add bank details before requesting payout" });
        }
        const balance = Number(provider.wallet.balance);
        if (balance < amount) {
            return res.status(400).json({
                error: "Insufficient balance",
                availableBalance: balance,
                requestedAmount: amount,
            });
        }
        // Create payout transaction (pending)
        const transaction = await prisma_1.default.walletTransaction.create({
            data: {
                walletId: provider.wallet.id,
                type: "PAYOUT",
                amount: amount,
                currency: provider.wallet.currency,
                status: "PENDING",
                description: `Payout request to bank account ending in ${provider.wallet.bankDetails.accountNumber.slice(-4)}`,
            },
        });
        // Deduct from wallet (will be reverted if payout fails)
        await prisma_1.default.expertWallet.update({
            where: { id: provider.wallet.id },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });
        // In production, you would initiate actual Razorpay payout here
        // For now, we'll simulate success after a delay
        // const payout = await razorpay.payouts.create({...});
        // Update transaction as completed (in real scenario, this would be done via webhook)
        await prisma_1.default.walletTransaction.update({
            where: { id: transaction.id },
            data: {
                status: "COMPLETED",
                razorpayPayoutId: `payout_${Date.now()}`, // Simulated payout ID
            },
        });
        res.json({
            success: true,
            message: "Payout request submitted successfully",
            transaction,
        });
    }
    catch (error) {
        console.error("Request payout error:", error);
        res.status(500).json({ error: "Failed to process payout request", details: error.message });
    }
});
exports.default = router;
