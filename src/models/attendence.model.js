import mongoose from "mongoose";

const attendenceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  status: {
    type: String, 
    enum: ["Present", "Absent"],
    required: true,
  }, 
});

export const Attendence = mongoose.model("Attendence", attendenceSchema);

