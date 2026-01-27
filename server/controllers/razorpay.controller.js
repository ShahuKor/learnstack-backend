import Razorpay from "razorpay";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { ApiError } from "../errors/ApiError.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { courseId, currency } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError("Course not Found", 404);
    }

    const newPurchase = new CoursePurchase({
      courseId: courseId,
      userId: userId,
      amount: course.price,
    });

    const razorpayOptions = {
      amount: course.price * 100, //amount in paise
      currency: "INR",
      receipt: `course_${courseId}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    if (order.amount_paid !== course.price) {
      throw new ApiError(
        "Amount is not paid completely, please retry payment again",
        401,
      );
    }

    newPurchase.paymentId = order.id;
    await newPurchase.save();

    res.status(200).json({
      success: true,
      order,
      course: {
        name: course.title,
        description: course.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { order_id, payment_id, razorpay_signature } = req.body;
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = razorpay_signature === expectedSignature;

    if (!isAuthentic) {
      throw new ApiError("Payment Verification Failed", 400);
    }
    const purchase = await CoursePurchase.findOne({
      paymentId: payment_id,
    });

    if (!purchase) {
      throw new ApiError("Payment Record not found", 400);
    }
    purchase.status == "completed";
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Payment Verification done Successfully!",
      courseId: purchase.courseId,
    });
  } catch (error) {
    next(error);
  }
};
