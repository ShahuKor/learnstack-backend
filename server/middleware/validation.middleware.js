import { body, query, validationResult, param } from "express-validator";
import { ApiError } from "../errors/ApiError";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validator) => validator.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new ApiError("Validation error", 400, extractedErrors);
  };
};

export const commonValidation = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .message("Pages must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .message("Limit must be between 1 to 100"),
  ],

  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  name: body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Please provide a valid Name"),
};

export const validateSignup = validate([
  commonValidation.email,
  commonValidation.name,
]);
