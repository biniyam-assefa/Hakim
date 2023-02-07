const mongoose = require("mongoose");
const { specialitySchema } = require("./speciality");
const { userSchema } = require("./user");
const { availabilitySchema } = require("./availability");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: userSchema,
      required: true,
    },
    universityAttended: {
      type: String,
      required: true,
    },
    experienceInYears: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    speciality: {
      type: specialitySchema,
      required: true,
    },
    portraitIMG: {
      type: String,
      required: true,
    },
    idIMG: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    availability: [
      {
        type: availabilitySchema,
      },
    ],
    price: {
      type: Number,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        patientID: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
    hospital: {
      type: String,
      required: true,
    },
    cvFile: {
      type: String,
      required: true,
    },
    eduFile: {
      type: String,
      required: true,
    },
    comments: [
      {
        patientID: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
