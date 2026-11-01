import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

// Only needed on some local networks/ISPs for Atlas SRV lookups.
// Render sets RENDER=true, so this is skipped in production.
if (!process.env.RENDER) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const { MONGO_URI, CLIENT_URL, PORT = 5000 } = process.env;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set");
  process.exit(1);
}

const app = express();

// Exact origins that are allowed
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-khaki-phi-62.vercel.app",
  CLIENT_URL,
].filter(Boolean);

// Matches your own Vercel preview/deployment URLs (your account only)
const vercelPreview =
  /^https:\/\/task-manager-[a-z0-9-]+-shameer125s-projects\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        vercelPreview.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/tasks", taskRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
