import mongoose from "mongoose";

const lectureProgressSchema = mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "Lecture reference is required"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatch: {
    type: Date,
    default: Date.now,
  },
});

const courseProgressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course user reference is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      minValue: 0,
      maxValue: 100,
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Update Last Access
courseProgressSchema.methods.updateLastAcessed = function () {
  this.lastAccessed = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Calculate course completion
courseProgressSchema.pre("save", function (next) {
  if (this.lectureProgress.length > 0) {
    const completedLectures = this.lectureProgress.filter(
      (lp) => lp.isCompleted,
    ).length;
    this.completionPercentage = Math.round(
      (completedLectures / this.lectureProgress.length) * 100,
    );
    this.isCompleted = this.completionPercentage === 100;
  }

  next();
});

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema,
);
