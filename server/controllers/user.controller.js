import { User } from "../models/user.model.js";
import { ApiError } from "../errors/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

export const createUserAccount = async (req, res, next) => {
  try {
    const { name, email, password, role = "student" } = req.body;
    const exitingUser = await User.findOne({ email: email });
    if (exitingUser) {
      throw new ApiError("User already exists", 400);
    }
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    await user.updateLastActive();
    await generateToken(res, user, "Account created Successfully");
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError("Invalid email or password", 404);
    }
    await user.updateLastActive();

    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", " ", { maxAge: 0 });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate({
      path: "enrolledCourses.course",
      select: "title description thumbnail",
    });
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        totalEnrolledCourses: user.totalEnrolledCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};
