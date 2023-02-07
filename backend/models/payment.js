const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingID: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["onhold", "completed", "refunded"],
      default: "onhold",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
