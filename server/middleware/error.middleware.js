// Global Error Handler
export const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

  if (statusCode >= 500) {
    console.error(err.stack);
  } else {
    console.error(err.message);
  }

  res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
