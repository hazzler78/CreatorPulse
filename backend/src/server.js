import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware.auth.js";
import goalsRouter from "./routes.goals.js";
import platformsRouter from "./routes.platforms.js";
import simulatorRouter from "./routes.simulator.js";
import accountsRouter from "./routes.accounts.js";
import authTikTokRouter from "./routes.auth-tiktok.js";
import { PORT } from "./config.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://creator-pulse-drab.vercel.app",
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "CreatorPulse" });
});

app.use(authMiddleware);

app.use("/api/goals", goalsRouter);
app.use("/api/platforms", platformsRouter);
app.use("/api/simulator", simulatorRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/auth/tiktok", authTikTokRouter);

app.listen(PORT, () => {
  console.log(`CreatorPulse backend listening on http://localhost:${PORT}`);
});

