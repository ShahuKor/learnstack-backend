import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running at ${PORT} in ${process.env.NODE_ENV}`);
});

//logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Body Parser Middleware
app.use(express.json({ limit: "10kb" })); // json data limit
app.use(express.urlencoded({ extended: true, limit: "10kb" })); //url data limit and configuration

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
