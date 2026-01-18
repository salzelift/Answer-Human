"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ArrowLeft } from "lucide-react";

export default function ExpertPhonePage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <Button variant="ghost" onClick={() => router.push("/expert")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <Phone className="h-5 w-5 text-emerald-600" />
              Audio Session
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-600">
                Audio session for appointment <span className="font-semibold">#{appointmentId}</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Audio call controls will appear here once integrated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
