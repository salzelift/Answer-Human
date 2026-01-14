import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import detailsMiddleware from "./utils/detailsMiddleware";
import authRoutes from "./auth";
import categoryRoutes from "./category";
import seekerRoutes from "./seeker";
import providerRoutes from "./provider";
import appointmentRoutes from "./appointment";
import providerOnboardingRoutes from "./providerOnboarding";

dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
