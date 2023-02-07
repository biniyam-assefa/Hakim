const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: new mongoose.Schema({
        fname: String,
        lname: String,
        email: String,
      }),
      required: true,
    },
    doctor: {
      type: new mongoose.Schema({
        fname: String,
        lname: String,
        email: String,
        inPersonPricing: Number,
        onlinePricing: Number,
      }),
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled", "incomplete"],
      required: true,
      default: "pending",
    },
    fee: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
