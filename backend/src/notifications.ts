import { sendEmail } from "./utils/resend";

interface ProposalEmailPayload {
  to: string;
  expertName: string;
  questionTitle: string;
  message: string;
  price: number;
  estimatedDuration: string;
}

interface AppointmentEmailPayload {
  to: string;
  seekerName: string;
  appointmentDate: string;
  appointmentTime: string;
  communicationMedium: string;
}

export const sendProposalEmail = async (payload: ProposalEmailPayload) => {
  return sendEmail({
    to: payload.to,
    subject: "New proposal received",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New proposal for your question</h2>
        <p><strong>${payload.expertName}</strong> sent you a proposal.</p>
        <p><strong>Question:</strong> ${payload.questionTitle}</p>
        <p><strong>Message:</strong> ${payload.message}</p>
        <p><strong>Price:</strong> $${payload.price}</p>
        <p><strong>Duration:</strong> ${payload.estimatedDuration}</p>
      </div>
    `,
  });
};

export const sendAppointmentEmail = async (payload: AppointmentEmailPayload) => {
  return sendEmail({
    to: payload.to,
    subject: "New appointment booked",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>You have a new appointment</h2>
        <p><strong>Seeker:</strong> ${payload.seekerName}</p>
        <p><strong>Date:</strong> ${payload.appointmentDate}</p>
        <p><strong>Time:</strong> ${payload.appointmentTime}</p>
        <p><strong>Communication:</strong> ${payload.communicationMedium}</p>
      </div>
    `,
  });
};

