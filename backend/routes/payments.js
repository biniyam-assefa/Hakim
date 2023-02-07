const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");

router.get("/", async (req, res) => {
  try {
    const payment = await Payment.find();
    res.send(payment);
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).send("No payment found with that ID");
  res.send(payment);
});

router.post("/", async (req, res) => {
  const newPayment = await new Payment({
    bookingID: req.body.bookingID,
    userID: req.body.userID,
    paymentInfo: req.body.paymentInfo,
    amount: req.body.amount,
  });

  try {
    const result = await newPayment.save();
    res.send(result);
  } catch (err) {
    res.send(err.message);
  }
});

router.put("/:id", async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!payment) return res.status(404).send("No payment found with that ID");

  res.send(payment);
});

module.exports = router;
