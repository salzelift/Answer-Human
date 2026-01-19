"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";
import { walletApi, WalletData, WalletTransaction, PayoutSummary } from "@/lib/api/wallet";
import { paymentApi } from "@/lib/api/payment";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ExpertPaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Wallet data
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Bank details form
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  // Payout form
  const [payoutAmount, setPayoutAmount] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [walletData, summaryData, transactionsData] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getPayoutSummary(),
        walletApi.getTransactions({ limit: 20 }),
      ]);

      setWallet(walletData.wallet);
      setSummary(summaryData);
      setTransactions(transactionsData.transactions);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: string } } };
      console.error("Error loading wallet data:", error);
      if (err.response?.status === 404) {
        toast({
          title: "Profile not found",
          description: "Complete expert onboarding first.",
        });
        router.push("/expert/onboarding");
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to load payment data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBankDetails = async () => {
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      toast({
        title: "Validation Error",
        description: "All bank details are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingBank(true);
      await walletApi.saveBankDetails({
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
      });

      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });

      // Refresh wallet data
      const walletData = await walletApi.getWallet();
      setWallet(walletData.wallet);

      // Clear form
      setAccountNumber("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to save bank details",
        variant: "destructive",
      });
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!wallet?.hasBankDetails) {
      toast({
        title: "Bank Details Required",
        description: "Please add bank details before requesting a payout",
        variant: "destructive",
      });
      return;
    }

    if (amount > (summary?.currentBalance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "Payout amount cannot exceed your current balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRequestingPayout(true);
      await paymentApi.requestPayout(amount);

      toast({
        title: "Payout Requested",
        description: `₹${amount} will be transferred to your bank account`,
      });

      setPayoutAmount("");

      // Refresh data
      await loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to process payout request",
        variant: "destructive",
      });
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4 text-lg font-medium">Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/expert/profile")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                  Expert Payments
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  Earnings & Payouts
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.currentBalance || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ArrowDownLeft className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Payouts</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalPayouts || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Pending Payouts</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.pendingPayouts || 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
            <TabsTrigger value="payout">Request Payout</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Payout Tab */}
          <TabsContent value="payout">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                  Request Payout
                </CardTitle>
                <CardDescription>
                  Transfer your earnings to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!wallet?.hasBankDetails ? (
                  <div className="text-center py-8 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Building2 className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                    <p className="font-semibold text-yellow-800">Bank Details Required</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Please add your bank details before requesting a payout
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Available Balance</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {formatCurrency(summary?.currentBalance || 0)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payout-amount">Payout Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          ₹
                        </span>
                        <Input
                          id="payout-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <div className="flex gap-2">
                        {[100, 500, 1000].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => setPayoutAmount(String(amt))}
                            disabled={(summary?.currentBalance || 0) < amt}
                          >
                            ₹{amt}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPayoutAmount(String(summary?.currentBalance || 0))
                          }
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    {wallet?.bankDetails && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">Payout will be sent to</p>
                        <p className="font-semibold text-blue-800">
                          {wallet.bankDetails.bankName} - {wallet.bankDetails.accountNumber}
                        </p>
                        <p className="text-sm text-blue-600">
                          {wallet.bankDetails.accountHolderName}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRequestPayout}
                      disabled={isRequestingPayout || !payoutAmount}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isRequestingPayout ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="mr-2 h-5 w-5" />
                          Request Payout
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Details Tab */}
          <TabsContent value="bank">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Bank Account Details
                </CardTitle>
                <CardDescription>
                  Add or update your bank account for receiving payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {wallet?.bankDetails && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-800">Bank Account Linked</p>
                    </div>
                    <p className="text-sm text-green-700">
                      {wallet.bankDetails.bankName} - {wallet.bankDetails.accountNumber}
                    </p>
                    <p className="text-sm text-green-600">
                      {wallet.bankDetails.accountHolderName}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-holder">Account Holder Name</Label>
                    <Input
                      id="account-holder"
                      placeholder="John Doe"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      placeholder="ABCD0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      placeholder="HDFC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveBankDetails}
                  disabled={isSavingBank}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSavingBank ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      {wallet?.bankDetails ? "Update Bank Details" : "Save Bank Details"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View all your earnings and payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No transactions yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Transactions will appear here when you receive payments
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border",
                          transaction.type === "CREDIT"
                            ? "bg-green-50 border-green-200"
                            : "bg-blue-50 border-blue-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center",
                              transaction.type === "CREDIT"
                                ? "bg-green-100"
                                : "bg-blue-100"
                            )}
                          >
                            {transaction.type === "CREDIT" ? (
                              <ArrowDownLeft
                                className={cn(
                                  "h-5 w-5",
                                  transaction.type === "CREDIT"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                )}
                              />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {transaction.type === "CREDIT"
                                ? "Payment Received"
                                : "Payout"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {transaction.description || formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-bold text-lg",
                              transaction.type === "CREDIT"
                                ? "text-green-600"
                                : "text-blue-600"
                            )}
                          >
                            {transaction.type === "CREDIT" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

