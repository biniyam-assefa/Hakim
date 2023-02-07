const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/booking");
const Doctor = require("../models/doctor");
const { User } = require("../models/user");
const Payment = require("../models/payment");
const Patient = require("../models/patient");
const Conversation = require("../models/conversation");

router.get("/", async (req, res) => {
  try {
    const booking = await Booking.find();
    res.send(booking);
  } catch (err) {
    res.send(err.message);
  }
});

//get recent patients list
router.get("/doctor/:docID/recentPatients", async (req, res) => {
  try {
    const doctor = await Doctor.findOne(
      {
        "user._id": mongoose.Types.ObjectId(req.params.docID),
      },
      "_id"
    );

    const bookings = await Booking.find({
      "doctor._id": doctor._id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const emails = [...new Set(bookings.map((booking) => booking.user.email))];

    const users = await User.find({
      email: {
        $in: emails,
      },
    });

    return res.send(users);
  } catch (error) {
    return res.status(500).send(error);
  }
});

//revenue of a single doctor
router.get("/revenue/:doctorID", async (req, res) => {
  try {
    const statuses = [
      "pending",
      "ongoing",
      "completed",
      "cancelled",
      "incomplete",
    ];
    const results = { total: 0 };

    for (const status of statuses) {
      const sum = await Booking.aggregate([
        {
          $match: {
            status: status,
            "doctor._id": mongoose.Types.ObjectId(req.params.doctorID),
          },
        },
        { $group: { _id: null, revenue: { $sum: "$fee" } } },
      ]);

      results[status] = sum[0] ? sum[0].revenue : 0;
      results.total += results[status];
    }

    res.send(results);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//all revenue based on status
router.get("/revenue", async (req, res) => {
  try {
    const statuses = [
      "pending",
      "ongoing",
      "completed",
      "cancelled",
      "incomplete",
    ];
    const results = { total: 0 };

    for (const status of statuses) {
      const sum = await Booking.aggregate([
        {
          $match: {
            status: status,
          },
        },
        { $group: { _id: null, revenue: { $sum: "$fee" } } },
      ]);

      results[status] = sum[0] ? sum[0].revenue : 0;
      results.total += results[status];
    }

    res.send(results);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//sort doctor list based on the number of bookings
router.get("/topDoctors", async (req, res) => {
  try {
    // Aggregate bookings and group them by doctor
    const bookings = await Booking.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: "$doctor",
          count: { $sum: 1 },
        },
      },
    ]);

    // Map doctor IDs to an array
    const doctorIds = bookings.map((b) => b._id);

    // Query for all doctors with the matching IDs
    const doctors = await Doctor.find({
      _id: { $in: doctorIds },
    }).sort({ count: -1 });

    res.status(200).send(doctors);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// router.get("/doctorsRevenue", async (req, res) => {
//   const doctors = await Doctor.find();
//   if (!doctors) return res.status(404).send("No doctors found!");

// });

// get details of a specific booking
router.get("/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send("No booking found");
  res.send(booking);
});

// get details of bookings of a doctor
router.get("/doctor/:id", async (req, res) => {
  try {
    let booking = await Booking.find({ "doctor._id": req.params.id });
    if (!booking) {
      booking = [];
    }
    res.status(200).send(booking);
  } catch (err) {
    res.status(500).send(err);
  }
});

// get detials of bookings of a patient
router.get("/patient/:id", async (req, res) => {
  try {
    const booking = await Booking.find({ "user._id": req.params.id });
    res.status(200).send(booking);
  } catch (err) {
    res.status(500).send(err);
  }
});

function paddedTime(time) {
  // Split the input string into an array of hour and minute values
  const [hour, minute] = time.split(":");

  // Pad the hour and minute values to two digits by adding a leading 0 if necessary
  const paddedHour = hour.length === 1 ? `0${hour}` : hour;
  const paddedMinute = minute.length === 1 ? `0${minute}` : minute;

  // Return a new string with the padded hour and minute values
  return `${paddedHour}:${paddedMinute}`;
}

//-------------------
// const targetDate = new Date('January 1, 2022 12:00:00'); // target date and time
// const currentDate = new Date(); // current date and time
// const delay = targetDate - currentDate; // delay in milliseconds

// function runOnSpecificTime() {
//   console.log('Function running on specific time');
// }

// setTimeout(runOnSpecificTime, delay);
//-------------------

//with trycatch
router.post("/", async (req, res) => {
  let transactionAborted = false;
  // Validate the required fields in the request body
  if (!req.body.payInfo) return res.status(400).send("Payment info is needed!");

  req.user = await User.findById(req.body.userID);
  if (!req.user) return res.status(404).send("No patient found");

  req.doctor = await Doctor.findById(req.body.doctorID);
  if (!req.doctor) return res.status(404).send("No doctor found");

  if (!req.doctor.price)
    return res.status(400).send("Doctor has not set his/her prices!");

  const bookings = await Booking.find();
  let checkBooking;
  if (bookings)
    checkBooking = await bookings.find(
      (book) =>
        book.user._id.toString() == req.user._id &&
        book.doctor._id.toString() == req.doctor._id &&
        book.status == ("pending" || "ongoing")
    );
  if (checkBooking)
    return res
      .status(400)
      .send(
        "There is already a pending / ongoing appointment with this doctor!"
      );
  // Create a new booking object with the request body data and doctor and user information
  const booking = new Booking({
    user: {
      _id: req.user._id,
      fname: req.user.fname,
      lname: req.user.lname,
      email: req.user.email,
      gender: req.user.gender,
    },
    doctor: {
      _id: req.doctor.id,
      fname: req.doctor.user.fname,
      lname: req.doctor.user.lname,
      email: req.doctor.user.email,
      price: req.doctor.price,
      speciality: req.doctor.speciality,
    },
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
    fee: req.doctor.price,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    //--- make the slot unavailable
    let time = booking.startTime;
    const day = time.getDay();

    if (!req.doctor.availability[day].isAvailable)
      return res.status(400).send("The doctor is unavailable on that day!");

    var index = req.doctor.availability[day].availableTime.findIndex(
      (av) =>
        av.startTime === paddedTime(`${time.getHours()}:${time.getMinutes()}`)
    );

    if (index < 0)
      return res
        .status(400)
        .send("Error: no available slot found for " + time.toString());

    if (index >= 0) {
      req.doctor.availability[day].availableTime[index].isAvailable = false;
      console.log(
        "Successfully booked ",
        req.doctor.availability[day].availableTime[index].startTime.toString()
      );
    }
    //---
    // check if the day is full
    if (
      req.doctor.availability[day].availableTime.every(
        (x) => x.isAvailable === false
      )
    )
      req.doctor.availability[day].isAvailable = false;
    else req.doctor.availability[day].isAvailable = true;

    await req.doctor.save();
    const result = await booking.save();

    //payment
    try {
      const newPayment = await new Payment({
        bookingID: result._id,
        userID: result.user._id,
        paymentInfo: req.body.payInfo,
        amount: req.doctor.price,
      });
      await newPayment.save();
    } catch (error) {
      transactionAborted == false && (await session.abortTransaction());
      transactionAborted = true;
      console.log(error);
      res.status(500).send("Error creating payment");
    }

    //conversation
    try {
      const conversation = await Conversation.findOne({
        members: {
          $all: [req.doctor.user._id, req.user._id],
        },
      });

      if (conversation) {
        // Conversation document exists, update it
        await Conversation.findByIdAndUpdate(conversation._id, {
          booking: result._id,
          wasActive: false,
        });
      } else {
        // Conversation document does not exist, create it
        const newConversation = new Conversation({
          members: [req.doctor.user._id, req.user._id],
          booking: result._id,
        });
        await newConversation.save();
      }
    } catch (error) {
      transactionAborted == false && (await session.abortTransaction());
      transactionAborted = true;
      console.log(error);
      res.status(500).send("Error creating Conversation");
    }

    transactionAborted == false && (await session.commitTransaction());
    transactionAborted == false && session.endSession();
    transactionAborted == false && res.status(200).send("Successfully Booked!");
  } catch (error) {
    await session.abortTransaction();
    transactionAborted = true;
    console.log(error);
    res.status(500).send("Error creating booking");
  }
});

//cancel booking
//complete booking
//update status of the booking
router.put("/:bookID", async (req, res) => {
  var book = await Booking.findById(req.params.bookID);
  if (!book) return res.status(400).send("No booking with that ID");

  if (book.status === "completed" || book.status === "cancelled")
    return res
      .status(403)
      .send(
        `Booking can't be updated because it is ${
          book.status === "completed" ? "already completed" : "cancelled"
        }!`
      );

  if (req.body.status === "cancelled") {
    const today = new Date();
    const startTime = new Date(book.startTime);
    startTime.setDate(startTime.getDate() - 1);
    if (startTime < today)
      return res
        .status(400)
        .send("You can only cancel appointments before 24 hours");
  }

  var payment = await Payment.findOne({ bookingID: req.params.bookID });
  if (!payment)
    return res.status(400).send("No payment found for the booking!");

  payment = await Payment.findOneAndUpdate(
    { _id: payment._id },
    {
      status:
        req.body.status === "cancelled" || req.body.status === "incomplete"
          ? "refunded"
          : "completed",
    },
    { new: true }
  );

  book = await Booking.findByIdAndUpdate(
    req.params.bookID,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (
    book.status === "completed" ||
    book.status === "cancelled" ||
    book.status == "incomplete"
  ) {
    const doctor = await Doctor.findById(book.doctor._id);
    if (!doctor) return res.status(404).send("No doctor found");

    let time = book.startTime;
    const day = time.getDay();

    try {
      var index = doctor.availability[day].availableTime.findIndex(
        (av) =>
          av.startTime === paddedTime(`${time.getHours()}:${time.getMinutes()}`)
      );

      if (index < 0)
        return res
          .status(400)
          .send("error the booking slot was not found for", time.toString());

      if (index >= 0) {
        doctor.availability[day].availableTime[index].isAvailable = true;
        doctor.availability[day].isAvailable = true;
        console.log(
          "Successfully Released!! ",
          doctor.availability[day].availableTime[index].startTime.toString()
        );
      }

      await doctor.save();
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  res.send(book);
});

//find bookings between patient and doctor
router.get("/find/:doctorID/:userID/:filter", async (req, res) => {
  // console.log(req.params.doctorID);
  // console.log(req.params.userID);
  // console.log(req.params.filter);

  const user1 = await Doctor.findById(req.params.doctorID);
  if (!user1)
    return res.status(400).send("Doctor with that ID does not exist!");

  const user2 = await User.findById(req.params.userID);
  if (!user2) return res.status(400).send("User with the ID does not exist!");

  if (!req.params.filter) return res.status(400).send("Filter is needed!");

  try {
    const bookings = await Booking.find();
    const booking = bookings.find(
      (book) =>
        book.user._id.toString() == user2._id.toString() &&
        book.doctor._id.toString() == user1._id.toString() &&
        book.status === req.params.filter
    );
    res.status(200).send(booking);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});

module.exports = router;
