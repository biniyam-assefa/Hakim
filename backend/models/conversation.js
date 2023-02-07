const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    booking: {
      type: String,
      required: true,
    },
    wasActive: {
      type: String,
      default: false,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
