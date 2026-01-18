"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  DollarSign,
  Video,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  ArrowLeft,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { appointmentApi } from "@/lib/api/appointment";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const appointmentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentApi.getById(appointmentId);
      setAppointment(data.appointment);
    } catch (error: any) {
      console.error("Error loading appointment:", error);
      if (error.response?.status === 404) {
        toast({
          title: "Not Found",
          description: "Appointment not found",
          variant: "destructive",
        });
        router.push("/appointments");
      } else {
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await appointmentApi.cancel(appointmentId);
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      loadAppointment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  const formatTime = (time: Date | string) => {
    const timeObj = typeof time === "string" ? new Date(time) : time;
    if (isNaN(timeObj.getTime())) return "Invalid time";

    return timeObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMediumIcon = (medium: string) => {
    switch (medium) {
      case "VIDEO_CALL":
        return <Video className="h-5 w-5" />;
      case "AUDIO_CALL":
        return <Phone className="h-5 w-5" />;
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Video className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading appointment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <p>Appointment not found</p>
              <Button
                onClick={() => router.push("/appointments")}
                className="mt-4"
              >
                Back to Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/appointments")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>

          {/* Header Card */}
          <Card className="mb-6 border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-20 w-20 border-4 border-gray-200">
                <AvatarImage
                  src={
                    appointment.knowledgeProvider?.profilePictureUrl ||
                    undefined
                  }
                  alt={appointment.knowledgeProvider?.name || "Expert"}
                />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xl">
                  {getInitials(appointment.knowledgeProvider?.name || "EX")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  Appointment with {appointment.knowledgeProvider?.name || "Expert"}
                </h1>
                <p className="text-gray-600 mb-3">
                  {appointment.questions?.questionTitle || "Consultation"}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      appointment.appointmentStatus === "CONFIRMED"
                        ? "default"
                        : appointment.appointmentStatus === "CANCELLED"
                        ? "destructive"
                        : "secondary"
                    }
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(appointment.appointmentStatus)}
                    {appointment.appointmentStatus}
                  </Badge>
                  <Badge
                    className={cn(
                      "flex items-center gap-1",
                      getPaymentStatusColor(appointment.paymentStatus)
                    )}
                  >
                    <DollarSign className="h-3 w-3" />
                    {appointment.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ${(appointment.totalPayment || appointment.totalPaymemnt || 0).toString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Date & Time */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold">
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getMediumIcon(appointment.communicationMedium)}
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Medium</p>
                <p className="font-semibold">
                  {appointment.communicationMedium?.replace("_", " ")}
                </p>
              </div>
              {appointment.appointmentStatus === "CONFIRMED" && (
                <Button className="w-full" size="sm">
                  Join Session
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Question Details */}
        {appointment.questions && (
          <Card className="mb-6 border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-semibold">
                  {appointment.questions.questionTitle}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">
                  {appointment.questions.questionDescription}
                </p>
              </div>
              {appointment.questions.questionTags &&
                appointment.questions.questionTags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.questions.questionTags.map(
                        (tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Expert Information */}
        <Card className="mb-6 border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Expert Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    appointment.knowledgeProvider?.profilePictureUrl ||
                    undefined
                  }
                  alt={appointment.knowledgeProvider?.name || "Expert"}
                />
                <AvatarFallback>
                  {getInitials(appointment.knowledgeProvider?.name || "EX")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {appointment.knowledgeProvider?.name || "Unknown Expert"}
                </p>
                {appointment.knowledgeProvider?.jobTitle && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {appointment.knowledgeProvider.jobTitle}
                    {appointment.knowledgeProvider.company &&
                      ` at ${appointment.knowledgeProvider.company}`}
                  </p>
                )}
                {appointment.knowledgeProvider?.location && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {appointment.knowledgeProvider.location}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(`/expert/${appointment.knowledgeProviderId}`)
              }
            >
              View Expert Profile
            </Button>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold">
                {appointment.paymentMethod || "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <Badge
                className={cn(
                  getPaymentStatusColor(appointment.paymentStatus)
                )}
              >
                {appointment.paymentStatus}
              </Badge>
            </div>
            {appointment.paymentTransactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm">
                  {appointment.paymentTransactionId}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">
                ${(appointment.totalPayment || appointment.totalPaymemnt || 0).toString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {appointment.appointmentStatus === "PENDING" && (
          <div className="flex gap-4 mt-6">
            <Button variant="destructive" className="flex-1" onClick={handleCancel}>
              Cancel Appointment
            </Button>
            <Button className="flex-1" onClick={() => router.push(`/expert/${appointment.knowledgeProviderId}/book`)}>
              Reschedule
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

