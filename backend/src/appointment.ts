import { Router, Response, Request } from "express";
import prisma from "./utils/prisma";
import { authenticate, AuthRequest } from "./middleware/auth";
import { sendAppointmentEmail } from "./notifications";
import { Prisma } from "@prisma/client";

const router = Router();

// Get available time slots for an expert
router.get("/experts/:expertId/available-slots", async (req: Request, res: Response) => {
  try {
    const { expertId } = req.params;
    const { date } = req.query; // Optional: specific date to check

    console.log(`Getting available slots for expert ID: ${expertId}`);

    let expert = await prisma.knowledgeProvider.findUnique({
      where: { id: expertId },
      select: {
        id: true,
        isAvailable: true,
        availableDays: true,
        availableTimes: true,
      },
    });

    // Fallback: try to find by userId
    if (!expert) {
      expert = await prisma.knowledgeProvider.findUnique({
        where: { userId: expertId },
        select: {
          id: true,
          isAvailable: true,
          availableDays: true,
          availableTimes: true,
        },
      });
    }

    if (!expert) {
      console.log(`Expert not found with ID: ${expertId}`);
      return res.status(404).json({ error: "Expert not found", providedId: expertId });
    }

    if (!expert.isAvailable) {
      return res.json({ 
        availableSlots: [],
        message: "Expert is currently unavailable" 
      });
    }

    // Get existing appointments for the expert (use expert.id since we might have found by userId)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        knowledgeProviderId: expert.id,
        appointmentStatus: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        appointmentDate: true,
        appointmentTime: true,
      },
    });

    // Convert availableDays and availableTimes to slots
    const availableSlots: Array<{ date: string; time: string }> = [];

    // If a specific date is requested
    if (date && typeof date === "string") {
      const requestedDate = new Date(date);
      const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      
      if (expert.availableDays.includes(dayName)) {
        // For each available time slot, check if it's already booked
        for (const timeSlot of expert.availableTimes) {
          const [startTime, endTime] = timeSlot.split("-");
          
          // Check if this slot is already booked
          const isBooked = existingAppointments.some((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            const aptTime = new Date(apt.appointmentTime);
            
            // Check if same date
            if (
              aptDate.getFullYear() === requestedDate.getFullYear() &&
              aptDate.getMonth() === requestedDate.getMonth() &&
              aptDate.getDate() === requestedDate.getDate()
            ) {
              const aptTimeStr = aptTime.toTimeString().slice(0, 5); // HH:MM
              return aptTimeStr === startTime.trim();
            }
            return false;
          });

          if (!isBooked) {
            availableSlots.push({
              date: requestedDate.toISOString().split("T")[0],
              time: timeSlot,
            });
          }
        }
      }
    } else {
      // Generate slots for the next 30 days
      const today = new Date();
      const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        // Use consistent day calculation (local time)
        const dayIndex = checkDate.getDay();
        const dayName = days[dayIndex];

        // Convert expert's availableDays to uppercase for consistent comparison
        const expertDaysUpper = expert.availableDays.map(d => d.toUpperCase());
        
        console.log(`Checking date ${checkDate.toISOString().split("T")[0]} - Day: ${dayName}, Expert available: ${expertDaysUpper}`);

        if (expertDaysUpper.includes(dayName)) {
          for (const timeSlot of expert.availableTimes) {
            const [startTime] = timeSlot.split("-");
            
            // Check if this slot is already booked
            const isBooked = existingAppointments.some((apt) => {
              const aptDate = new Date(apt.appointmentDate);
              const aptTime = new Date(apt.appointmentTime);
              
              if (
                aptDate.getFullYear() === checkDate.getFullYear() &&
                aptDate.getMonth() === checkDate.getMonth() &&
                aptDate.getDate() === checkDate.getDate()
              ) {
                const aptTimeStr = aptTime.toTimeString().slice(0, 5);
                return aptTimeStr === startTime.trim();
              }
              return false;
            });

            if (!isBooked) {
              availableSlots.push({
                date: checkDate.toISOString().split("T")[0],
                time: timeSlot,
              });
            }
          }
        }
      }
    }

    res.json({ availableSlots, expert: { id: expert.id, isAvailable: expert.isAvailable } });
  } catch (error: any) {
    console.error("Get available slots error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Create a new appointment
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      expertId,
      appointmentDate,
      appointmentTime,
      communicationMedium,
      questionId,
      paymentMethod,
    } = req.body;

    if (!expertId || !appointmentDate || !appointmentTime || !communicationMedium || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the seeker
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    // Verify expert exists (try by id first, then by userId as fallback)
    let expert = await prisma.knowledgeProvider.findUnique({
      where: { id: expertId },
      include: { user: true },
    });

    if (!expert) {
      expert = await prisma.knowledgeProvider.findUnique({
        where: { userId: expertId },
        include: { user: true },
      });
    }

    if (!expert) {
      return res.status(404).json({ error: "Expert not found", providedId: expertId });
    }
    
    // Use the actual expert ID for the appointment
    const actualExpertId = expert.id;

    if (!expert.isAvailable) {
      return res.status(400).json({ error: "Expert is not available" });
    }

    // Check if the time slot is available
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, ...appointmentTime.split(":").map(Number));
    
    // Get day name using UTC to avoid timezone shifts
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const dayIndex = new Date(year, month - 1, day).getDay();
    const dayName = days[dayIndex];

    // Convert expert's availableDays to uppercase for consistent comparison
    const expertDaysUpper = expert.availableDays.map(d => d.toUpperCase());
    
    console.log(`Booking check - Date: ${appointmentDate}, Day: ${dayName}, Expert available days: ${expertDaysUpper}`);

    if (!expertDaysUpper.includes(dayName)) {
      return res.status(400).json({ 
        error: "Expert is not available on this day",
        details: {
          requestedDay: dayName,
          availableDays: expertDaysUpper
        }
      });
    }

    // Check if slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        knowledgeProviderId: actualExpertId,
        appointmentDate: new Date(appointmentDate),
        appointmentStatus: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingAppointment) {
      const existingTime = new Date(existingAppointment.appointmentTime).toTimeString().slice(0, 5);
      const requestedTime = appointmentTime.slice(0, 5);
      
      if (existingTime === requestedTime) {
        return res.status(400).json({ error: "This time slot is already booked" });
      }
    }

    // Create the appointment
    // If questionId is not provided, create a placeholder question
    let finalQuestionId = questionId;
    if (!finalQuestionId) {
      // Create a placeholder question for direct bookings
      const placeholderQuestion = await prisma.questions.create({
        data: {
          knowledgeSeekerId: seeker.id,
          questionTitle: `Session with ${expert.name}`,
          questionDescription: `Direct booking session`,
          questionCategory: "General",
          questionTags: [],
          questionStatus: "PENDING",
        },
      });
      finalQuestionId = placeholderQuestion.id;
    }

    const appointment = await prisma.appointment.create({
      data: {
        knowledgeProviderId: actualExpertId,
        knowledgeSeekerId: seeker.id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentDateTime,
        communicationMedium: communicationMedium.toUpperCase().replace(/-/g, "_"),
        paymentMethod: paymentMethod.toUpperCase().replace(/-/g, "_"),
        totalPaymemnt: 0, // TODO: Calculate actual price
        questionsId: finalQuestionId,
        appointmentStatus: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        knowledgeProvider: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
        knowledgeSeeker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (expert.user?.email) {
      await sendAppointmentEmail({
        to: expert.user.email,
        seekerName: seeker.name,
        appointmentDate,
        appointmentTime,
        communicationMedium,
      });
    }

    res.status(201).json({ appointment });
  } catch (error: any) {
    console.error("Create appointment error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get appointments for the authenticated user (seeker)
router.get("/my-appointments", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker) {
      return res.status(404).json({ error: "Seeker profile not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        knowledgeSeekerId: seeker.id,
      },
      include: {
        knowledgeProvider: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
            description: true,
          },
        },
        questions: {
          select: {
            id: true,
            questionTitle: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    res.json({ appointments });
  } catch (error: any) {
    console.error("Get appointments error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get appointment by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        knowledgeProvider: true,
        knowledgeSeeker: true,
        questions: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify the user has access to this appointment
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker || appointment.knowledgeSeekerId !== seeker.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ appointment });
  } catch (error: any) {
    console.error("Get appointment error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Cancel an appointment
router.put("/:id/cancel", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify the user has access
    const seeker = await prisma.knowledgeSeeker.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!seeker || appointment.knowledgeSeekerId !== seeker.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentStatus: "CANCELLED",
      },
      include: {
        knowledgeProvider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ appointment: updatedAppointment });
  } catch (error: any) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;


