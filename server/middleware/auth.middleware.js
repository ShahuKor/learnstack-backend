import { ApiError } from "../errors/ApiError";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new ApiError("You are not logged in", 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      throw new ApiError("Invalid Token Payload", 401);
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("The token is expired", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Invalid Token", 401));
    }

    next(error);
  }
};
