"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Loader2,
  Eye,
} from "lucide-react";
import { appointmentApi } from "@/lib/api/appointment";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter, paymentFilter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data.appointments || []);
    } catch (error: any) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.knowledgeProvider?.name.toLowerCase().includes(query) ||
          apt.questions?.questionTitle.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.appointmentStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((apt) => apt.paymentStatus === paymentFilter);
    }

    setFilteredAppointments(filtered);
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
      year: "numeric",
      month: "short",
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
            <p className="mt-2">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter((apt) =>
    ["PENDING", "CONFIRMED"].includes(apt.appointmentStatus)
  ).length;
  const cancelledAppointments = appointments.filter(
    (apt) => apt.appointmentStatus === "CANCELLED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                Appointments
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">My Appointments</h1>
              <p className="text-slate-600 mt-2">
                Manage and track all your appointments
              </p>
            </div>
            <Button onClick={() => router.push("/explore")}>Book New Appointment</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-slate-900">{totalAppointments}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Upcoming</p>
                <p className="text-2xl font-semibold text-slate-900">{upcomingAppointments}</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Cancelled</p>
                <p className="text-2xl font-semibold text-slate-900">{cancelledAppointments}</p>
              </CardContent>
            </Card>
          </div>

        {/* Filters */}
        <Card className="mb-6 border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by expert or question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Filter */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No appointments found</p>
              <p className="text-sm">
                {appointments.length === 0
                  ? "You haven't booked any appointments yet"
                  : "No appointments match your filters"}
              </p>
              {appointments.length === 0 && (
                <Button
                  onClick={() => router.push("/explore")}
                  className="mt-4"
                >
                  Explore Experts
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/appointments/${appointment.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Expert Avatar */}
                    <Avatar className="h-16 w-16 border-2 border-gray-200">
                      <AvatarImage
                        src={
                          appointment.knowledgeProvider?.profilePictureUrl ||
                          undefined
                        }
                        alt={appointment.knowledgeProvider?.name || "Expert"}
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {getInitials(
                          appointment.knowledgeProvider?.name || "EX"
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {appointment.knowledgeProvider?.name ||
                              "Unknown Expert"}
                          </h3>
                          <p className="text-gray-600">
                            {appointment.questions?.questionTitle ||
                              "Consultation"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ${(appointment.totalPayment || appointment.totalPaymemnt || 0).toString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(appointment.appointmentTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            appointment.appointmentStatus === "CONFIRMED"
                              ? "default"
                              : appointment.appointmentStatus === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {appointment.appointmentStatus}
                        </Badge>
                        <Badge
                          className={cn(
                            getPaymentStatusColor(appointment.paymentStatus)
                          )}
                        >
                          {appointment.paymentStatus}
                        </Badge>
                        <Badge variant="outline">
                          {appointment.communicationMedium?.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{appointments.length}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {
                      appointments.filter(
                        (a) => a.appointmentStatus === "CONFIRMED"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {
                      appointments.filter(
                        (a) => a.appointmentStatus === "PENDING"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    $
                    {appointments
                      .filter((a) => a.paymentStatus === "PAID")
                      .reduce(
                        (sum, a) =>
                          sum + parseFloat((a.totalPayment || a.totalPaymemnt || 0).toString()),
                        0
                      )
                      .toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Paid</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

