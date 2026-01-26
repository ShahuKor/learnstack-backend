import jwt from "jsonwebtoken";

export const generateToken = function (res, user, message) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
};
