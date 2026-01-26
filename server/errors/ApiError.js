export class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.name = this.constructor.name;

    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
