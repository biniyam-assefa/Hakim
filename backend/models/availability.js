const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  availableTime: [
    {
      type: new mongoose.Schema({
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      }),
    },
  ],
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const Availabiltiy = mongoose.model("Availability", availabilitySchema);

module.exports.Availabiltiy = Availabiltiy;
module.exports.availabilitySchema = availabilitySchema;
