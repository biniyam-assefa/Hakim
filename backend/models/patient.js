const mongoose = require("mongoose");
const { userSchema } = require("./user");

const Patient = mongoose.model(
  "Patient",
  new mongoose.Schema({
    user: {
      type: userSchema,
      required: true,
    },
    chronicDisease: {
      type: String,
    },
  })
);

module.exports = Patient;
