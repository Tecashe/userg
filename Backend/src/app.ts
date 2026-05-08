import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import routes from "./routes/index.js";
import clerkWebhooks from "./controllers/clerk.controller.js";

// Configure Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Trust proxy headers (required when behind Vercel / reverse proxies)
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://ugc-ai-tau.vercel.app",
  "https://ugc-ai.vasusinghal.com",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow exact matches
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Vercel preview deployments for this repo
      if (/^https:\/\/[a-z0-9-]+-tecashe\.vercel\.app$/.test(origin)) return callback(null, true);
      if (/^https:\/\/ugc-ai[a-z0-9-]*\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Global rate limit: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict rate limit for AI generation endpoints: 10 per hour per IP
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Generation limit reached, please try again in an hour." },
});

app.use(globalLimiter);

// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(clerkMiddleware());

app.use("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

app.use(express.json());

// Apply strict limiter to generation routes
app.use("/api/project/generate", generationLimiter);

// All Routes
app.use("/api", routes);

export default app;
