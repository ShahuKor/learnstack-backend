import dotenv from "dotenv";
import express from "express";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running at ${PORT} in ${process.env.NODE_ENV}`);
});

//Body Parser Middleware
app.use(express.json({ limit: "10kb" })); // json data limit
app.use(express.urlencoded({ extended: true, limit: "10kb" })); //url data limit and configuration

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not Found",
  });
});
