import api from "../axios";
import { Appointment, CreateAppointmentRequest, AvailableSlot } from "@/types/appointment.types";

export const appointmentApi = {
  // Get available time slots for an expert
  getAvailableSlots: async (expertId: string, date?: string): Promise<AvailableSlot[]> => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const queryString = params.toString();
    const url = `/appointments/experts/${expertId}/available-slots${queryString ? `?${queryString}` : ""}`;
    
    const response = await api.get(url);
    return response.data.availableSlots;
  },

  // Create a new appointment
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post("/appointments", data);
    return response.data.appointment;
  },

  // Get user's appointments
  getMyAppointments: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await api.get("/appointments/my-appointments");
    return response.data;
  },

  // Get appointment by ID
  getById: async (id: string): Promise<{ appointment: Appointment }> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Cancel an appointment
  cancel: async (id: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data.appointment;
  },
};


