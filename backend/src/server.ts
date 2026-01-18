import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import detailsMiddleware from "./utils/detailsMiddleware";
import authRoutes from "./auth";
import categoryRoutes from "./category";
import seekerRoutes from "./seeker";
import providerRoutes from "./provider";
import appointmentRoutes from "./appointment";
import providerOnboardingRoutes from "./providerOnboarding";
import feedRoutes from "./feed";
import proposalRoutes from "./proposals";
import { initSocket } from "./realtime";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors());

app.use(detailsMiddleware);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Answer Human Server is Healthy and running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/seeker", seekerRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/provider-onboarding", providerOnboardingRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/proposals", proposalRoutes);

const PORT = process.env.PORT || 8000;
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
