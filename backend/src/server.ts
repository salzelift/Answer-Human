import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import detailsMiddleware from "./utils/detailsMiddleware";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(detailsMiddleware);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Answer Human Server is Healthy and running" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
