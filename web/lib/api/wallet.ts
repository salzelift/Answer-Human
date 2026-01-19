import api from "../axios";

export interface WalletData {
  id: string;
  balance: number;
  currency: string;
  hasBankDetails: boolean;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  } | null;
}

export interface WalletTransaction {
  id: string;
  type: "CREDIT" | "PAYOUT";
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string | null;
  razorpayPaymentId: string | null;
  razorpayPayoutId: string | null;
  appointmentId: string | null;
  createdAt: string;
}

export interface PayoutSummary {
  currentBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
  currency: string;
}

export interface BankDetailsInput {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export const walletApi = {
  // Get wallet details
  getWallet: async (): Promise<{ wallet: WalletData }> => {
    const response = await api.get("/wallet");
    return response.data;
  },

  // Get transactions
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: "CREDIT" | "PAYOUT";
  }): Promise<{
    transactions: WalletTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get("/wallet/transactions", { params });
    return response.data;
  },

  // Save bank details
  saveBankDetails: async (data: BankDetailsInput) => {
    const response = await api.post("/wallet/bank-details", data);
    return response.data;
  },

  // Get payout summary
  getPayoutSummary: async (): Promise<PayoutSummary> => {
    const response = await api.get("/wallet/payout-summary");
    return response.data;
  },

  // Request payout to bank account
  requestPayout: async (amount: number): Promise<{
    success: boolean;
    message: string;
    transaction: WalletTransaction;
  }> => {
    const response = await api.post("/payments/request-payout", { amount });
    return response.data;
  },
};

