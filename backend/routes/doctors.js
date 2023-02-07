const Express = require("express");
const router = Express.Router();
const { User } = require("../models/user");
const Doctors = require("../models/doctor");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const upload = require("../middleware/upload");
const { Speciality } = require("../models/speciality");
const { Availabiltiy } = require("../models/availability");
const Bookings = require("../models/booking");
const mongoose = require("mongoose");

//find doctor using USERID
router.get("/user/:userID", async (req, res) => {
  try {
    const doctor = await Doctors.findOne({ "user._id": req.params.userID });
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }
    res.send(doctor);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//add comment
router.post("/comment/:docID", async (req, res) => {
  const doc = await Doctors.findById(req.params.docID);
  if (!doc) return res.status(400).send("No doctor with that ID!");

  const findComment = doc.comments.find(
    (comment) => comment.patientID === req.body.patientID
  );

  if (findComment)
    return res
      .status(400)
      .send("You have already commented and not allowed to comment again!");

  try {
    doc.comments.push({
      patientID: req.body.patientID,
      comment: req.body.comment,
    });
    await doc.save();
    res.status(200).send("Comment added successfully!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//add rating
router.post("/rate/:docID", async (req, res) => {
  const doc = await Doctors.findById(req.params.docID);
  if (!doc) return res.status(400).send("No doctor with that ID!");

  if (req.body.score < 1 || req.body.score > 5) {
    return res.status(400).send("Please input only the allowed range: 1-5");
  }

  const findRating = doc.ratings.find(
    (rating) => rating.patientID === req.body.patientID
  );

  if (findRating)
    return res
      .status(400)
      .send("You have already rated and not allowed to rate again!");

  var sum = 0;
  for (var i = 0; i < doc.ratings.length; i++) {
    sum = sum + doc.ratings[i].score;
  }

  sum += req.body.score;
  doc.avgRating = sum / (doc.ratings.length + 1);

  try {
    doc.ratings.push({
      patientID: req.body.patientID,
      score: req.body.score,
    });
    await doc.save();
    res.status(200).send("Rating added successfully!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//filter by speciality
router.get("/filter/:speciality", async (req, res) => {
  const speciality = await Speciality.find();
  if (!speciality) return res.status(400).send("No speciality found!");

  const findSpecial = speciality.find(
    (spec) => spec.name === req.params.speciality
  );

  // console.log(req.params.speciality);

  if (!findSpecial)
    return res
      .status(400)
      .send(`No speciality with the name ${req.params.speciality} found`);

  try {
    const doctors = await Doctors.find();
    const specDoctors = doctors.filter(
      (doc) => doc.speciality._id.toString() === findSpecial._id.toString()
    );
    // console.log(specDoctors);
    res.status(200).send(specDoctors);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//list of all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctors.find();
    res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//list of approved
router.get("/approved", async (req, res) => {
  try {
    const doctors = await Doctors.find({ isApproved: true });
    res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  const doctor = await Doctors.findById(req.params.id);
  if (!doctor) return res.status(404).send("No doctor found");
  // console.log(req.params.id);
  try {
    res.status(200).send(doctor);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const cpUpload = upload.fields([
  { name: "portraitIMG" },
  { name: "idIMG" },
  { name: "eduFile" },
  { name: "cvFile" },
]);
router.post("/", cpUpload, async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  const special = await Speciality.findById(req.body.speciality);
  if (!special) return res.status(400).send("Speciality not found!");

  user = new User(
    _.pick(req.body, [
      "fname",
      "lname",
      "email",
      "password",
      "phoneNumber",
      "gender",
      "birthdate",
    ])
  );

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user.userRole = "Doctor";

  var doctor = new Doctors(
    _.pick(req.body, [
      "universityAttended",
      "experienceInYears",
      "description",
      "price",
      "hospital",
    ])
  );

  doctor.user = user;
  doctor.speciality = special;

  if (req.files) {
    doctor.portraitIMG = req.files["portraitIMG"][0].path;
    doctor.idIMG = req.files["idIMG"][0].path;
    doctor.cvFile = req.files["cvFile"][0].path;
    doctor.eduFile = req.files["eduFile"][0].path;
  }

  function assignDate(num) {
    if (num == 0) return "Sunday";
    else if (num == 1) return "Monday";
    else if (num == 2) return "Tuesday";
    else if (num == 3) return "Wednesday";
    else if (num == 4) return "Thursday";
    else if (num == 5) return "Friday";
    else if (num == 6) return "Saturday";
  }

  let avail = new Availabiltiy({
    day: "",
  });

  for (var i = 0; i < 7; i++) {
    avail.day = assignDate(i);
    doctor.availability[i] = avail;
  }

  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const result = await user.save();
      const token = user.generateAuthToken();
      await doctor.save();
      await session.commitTransaction();
      res
        .header("x-auth-token", token)
        .send(_.pick(result, ["_id", "name", "email"]));
    });
    session.endSession();
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

router.put("/:id", async (req, res) => {
  let special;
  if (req.body.specialityID) {
    special = await Speciality.findById(req.body.specialityID);
    if (req.body.specialityID && !special)
      return res.status(400).send("Speciality not found!");
  }

  try {
    const doctor = await Doctors.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, [
        "experienceInYears",
        "description",
        "isApproved",
        "price",
        "hospital",
      ]),
      { new: true }
    );

    if (req.body.specialityID) {
      if (special.name !== doctor.speciality.name) doctor.speciality = special;
      await doctor.save();
    }

    if (!doctor) return res.status(404).send("No doctor found");

    res.status(200).send("Doctor Profile updated successfully!");
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
});

router.get("/:id/bookings", async (req, res) => {
  try {
    const doctor = await Doctors.findById(req.params.id);
    if (!doctor) return res.status(404).send("No doctor found with that ID");
    const booking = await Bookings.find();
    if (booking) res.send(booking);
    else res.send("no book");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

const consolidateAvailability = (availabilityArray) => {
  const consolidatedAvailability = [];

  availabilityArray.forEach((day) => {
    const consolidatedDay = {
      day: day.day,
      availableTime: [],
      isAvailable: day.isAvailable,
    };

    let currentAvailability = {
      startTime: day.availableTime[0] && day.availableTime[0].startTime,
      endTime: day.availableTime[0] && day.availableTime[0].endTime,
    };

    for (let i = 1; i < day.availableTime.length; i++) {
      const currentTime = day.availableTime[i];
      if (currentAvailability.endTime === currentTime.startTime) {
        currentAvailability.endTime = currentTime.endTime;
      } else {
        consolidatedDay.availableTime.push(currentAvailability);
        currentAvailability = {
          startTime: currentTime.startTime,
          endTime: currentTime.endTime,
        };
      }
    }

    consolidatedDay.availableTime.push(currentAvailability);
    consolidatedAvailability.push(consolidatedDay);
  });

  return consolidatedAvailability;
};

router.get("/:id/availability", async (req, res) => {
  try {
    const doctor = await Doctors.findById(req.params.id);
    if (!doctor) return res.status(404).send("No doctor found with that ID");
    const availability = doctor.availability;
    res.send(availability);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

//add & modify doctor availability
router.post("/:id/availability", async (req, res) => {
  const doctor = await Doctors.findById(req.params.id);
  const days = req.body.days;

  if (!doctor)
    return res.status(400).send("DOCTOR WITH THIS ID DOES NOT EXIST!");

  function addThirty(time) {
    const timeParts = time.split(":");
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);

    minutes += 30;

    if (minutes >= 60) {
      hours += 1;
      minutes = minutes % 60;
    }

    if (hours >= 24) {
      hours = hours % 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  function assignAvailableTime(ind, start, end) {
    const day = ind;
    const startTime = start.split(":");
    const endTime = end.split(":");

    var hrDiff = parseInt(endTime[0]) - parseInt(startTime[0]);
    var minDiff = parseInt(startTime[1]) - parseInt(startTime[1]);

    var iteration = minDiff === 0 ? hrDiff * 2 : hrDiff * 2 + 1;
    var availableTime = {
      startTime: start,
      endTime: addThirty(start),
      isAvailable: true,
    };

    if (
      doctor.availability[day].availableTime.find(
        (item) => item.startTime === start
      )
    )
      return res
        .status(400)
        .send("There is already an availability registered at that time");
    else doctor.availability[day].availableTime.push(availableTime);

    for (var i = 0; i < iteration - 1; i++) {
      availableTime = {
        startTime:
          doctor.availability[day].availableTime[
            doctor.availability[day].availableTime.length - 1
          ].endTime,
        endTime: addThirty(
          doctor.availability[day].availableTime[
            doctor.availability[day].availableTime.length - 1
          ].endTime
        ),
        isAvailable: true,
      };
      doctor.availability[day].availableTime.push(availableTime);
    }
  }

  doctor.availability.forEach((item) => {
    item.availableTime = [];
  });

  days.forEach((day) => {
    day.times.forEach((time) => {
      assignAvailableTime(day.index, time.startTime, time.endTime);
    });
  });

  try {
    await doctor.save();
    res.send(doctor.availability);
  } catch (err) {
    res.status(400).send(err);
  }
});

//add doctor's available times
// router.post("/:id/availability", async (req, res) => {
//   const doctor = await Doctors.findById(req.params.id);
//   const days = req.body.days;

//   // const docStartTime = new Date(req.body.docStartTime);
//   // const docEndTime = new Date(req.body.docEndTime);

//   if (!doctor)
//     return res.status(400).send("DOCTOR WITH THIS ID DOES NOT EXIST!");

//   // var hrDiff = docEndTime.getHours() - docStartTime.getHours();
//   // var minDiff = docEndTime.getMinutes() - docStartTime.getMinutes();

//   // if (minDiff !== -30 && minDiff !== 30 && minDiff !== 0)
//   //   return res
//   //     .status(400)
//   //     .send(
//   //       "The difference between startime and endtime is not within 30 minutes interval"
//   //     );

//   // function assignDate(d) {
//   //   if (d == "Sunday") return 0;
//   //   else if (d == "Monday") return 1;
//   //   else if (d == "Tuesday") return 2;
//   //   else if (d == "Wednesday") return 3;
//   //   else if (d == "Thursday") return 4;
//   //   else if (d == "Friday") return 5;
//   //   else if (d == "Saturday") return 6;
//   // }

//   function addThirty(time) {
//     // Split the input time into hours and minutes
//     const timeParts = time.split(":");
//     let hours = parseInt(timeParts[0]);
//     let minutes = parseInt(timeParts[1]);

//     // Increment the minutes by 30
//     minutes += 30;

//     // If the minutes are greater than or equal to 60, increment the hours by 1 and set the minutes to the remainder of minutes divided by 60
//     if (minutes >= 60) {
//       hours += 1;
//       minutes = minutes % 60;
//     }

//     // If the hours are greater than or equal to 24, set the hours to the remainder of hours divided by 24
//     if (hours >= 24) {
//       hours = hours % 24;
//     }

//     // Return the incremented time as a string in the format "HH:MM"
//     return `${hours.toString().padStart(2, "0")}:${minutes
//       .toString()
//       .padStart(2, "0")}`;
//   }

//   function assignAvailableTime(ind, start, end) {
//     const day = ind;
//     const startTime = start.split(":");
//     const endTime = end.split(":");

//     var hrDiff = parseInt(endTime[0]) - parseInt(startTime[0]);
//     var minDiff = parseInt(startTime[1]) - parseInt(startTime[1]);

//     var iteration = minDiff === 0 ? hrDiff * 2 : hrDiff * 2 + 1;
//     var availableTime = {
//       startTime: start,
//       endTime: addThirty(start),
//       isAvailable: true,
//     };

//     if (
//       doctor.availability[day].availableTime.find(
//         (item) => item.startTime === start
//       )
//     )
//       return res
//         .status(400)
//         .send("There is already an availability registered at that time");
//     else doctor.availability[day].availableTime.push(availableTime);

//     for (var i = 0; i < iteration - 1; i++) {
//       availableTime = {
//         startTime:
//           doctor.availability[day].availableTime[
//             doctor.availability[day].availableTime.length - 1
//           ].endTime,
//         endTime: addThirty(
//           doctor.availability[day].availableTime[
//             doctor.availability[day].availableTime.length - 1
//           ].endTime
//         ),
//         isAvailable: true,
//       };
//       doctor.availability[day].availableTime.push(availableTime);
//     }
//   }

//   // days.forEach((day) => {
//   //   day.times.forEach((time) => {
//   //     assignAvailableTime(day.index, time.startTime, time.endTime);
//   //   });
//   // });

//   days.forEach((day) => {
//     day.times.forEach((time) => {
//       // Find the index of the availability object in the array that has the same start time as the new availability
//       const index = doctor.availability[day.index].availableTime.findIndex(
//         (item) => item.startTime === time.startTime
//       );
//       // If the index is not -1, delete the object from the array
//       if (index !== -1) {
//         doctor.availability[day.index].availableTime.splice(index, 1);
//       }
//       assignAvailableTime(day.index, time.startTime, time.endTime);
//     });
//   });

//   days.forEach(
//     (day) => (doctor.availability[day.index].isAvailable = day.isAvailable)
//   );

//   const result = await doctor.save();
//   res.send(result);
// });

//edit doctor's available times
// router.put("/:id/availability", async (req, res) => {
//   try {
//     const doctor = await Doctors.findByIdAndUpdate(
//       req.params.id,
//       { $set: { availability: req.body.availability } },
//       { new: true }
//     );

//     if (!doctor)
//       return res.status(400).send("DOCTOR WITH THIS ID DOES NOT EXIST!");

//     res.send(doctor.availability);
//   } catch (error) {
//     // Handle the error here
//     console.error(error);
//     res.status(500).send("An error occurred while updating the availability.");
//   }
// });

router.get("/:id/availability/consolidated", async (req, res) => {
  try {
    const doctor = await Doctors.findById(req.params.id);
    if (!doctor) return res.status(404).send("No doctor found with that ID");
    const availability = doctor.availability;
    res.send(consolidateAvailability(availability));
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const doctor = await Doctors.findByIdAndRemove(req.params.id);
      const user = doctor.user;
      await User.findOneAndRemove({ email: user.email });

      if (!doctor || !user) return res.status(404).send("No doctor found");

      res.send(doctor);
      session.endSession();
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
