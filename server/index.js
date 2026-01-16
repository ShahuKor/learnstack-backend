import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//cors config
var corsOptions = {
  origin: process.env.CLIENT_URI || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};

app.listen(PORT, () => {
  console.log(`server is running at ${PORT} in ${process.env.NODE_ENV}`);
});

//Rate Limiting Setup Config
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too Many Requests",
  statusCode: 429,
});

// Security Middleware
// 1. rate limit for /api routes
app.use("/api", limiter);

// 2. protect Node. js Express apps from common security threats such as Cross-Site Scripting (XSS) and click-jacking attacks
app.use(helmet());

// 3. Mongoose Santize for . and $ characters from user input (req.body , params etc.)
app.use(mongoSanitize());

// 4. hpp security
app.use(hpp());

//logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Body Parser Middleware
app.use(express.json({ limit: "10kb" })); // json data limit
app.use(express.urlencoded({ extended: true, limit: "10kb" })); //url data limit and configuration
app.use(cookieParser());
app.use(cors());

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// API Routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not Found",
  });
});
