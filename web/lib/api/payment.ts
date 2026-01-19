import api from "../axios";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appointmentId: string;
}

export const paymentApi = {
  // Create a payment order
  createOrder: async (amount: number, appointmentId: string): Promise<CreateOrderResponse> => {
    const response = await api.post("/payments/create-order", {
      amount,
      appointmentId,
      currency: "INR",
    });
    return response.data;
  },

  // Verify payment after Razorpay checkout
  verifyPayment: async (data: VerifyPaymentRequest) => {
    const response = await api.post("/payments/verify-payment", data);
    return response.data;
  },

  // Request payout (for experts)
  requestPayout: async (amount: number) => {
    const response = await api.post("/payments/request-payout", { amount });
    return response.data;
  },
};

