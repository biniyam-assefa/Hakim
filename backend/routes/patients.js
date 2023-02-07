const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const Patient = require("../models/patient");
const _ = require("lodash");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  try {
    const patinet = await Patient.find().select("-user.password");
    res.send(patinet);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/user/:userID", async (req, res) => {
  try {
    const user = await Patient.findOne({ "user._id": req.params.userID });
    if (!user) {
      return res.status(404).send("Patient not found");
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).send("No patient found");
  res.send(patient);
});

router.post("/", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  const newUser = new User(
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
  newUser.password = await bcrypt.hash(req.body.password, salt);

  const patient = new Patient({
    chronicDisease: req.body?.chronicDisease,
  });

  newUser.userRole = "Patient";
  patient.user = newUser;

  try {
    const result = await newUser.save();
    const token = newUser.generateAuthToken();
    await patient.save();
    res
      .header("x-auth-token", token)
      .send(_.pick(result, ["_id", "name", "email"]));
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

router.put("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { chronicDisease: req.body.chronicDisease },
    { new: true }
  );

  if (!patient) return res.status(404).send("No patient found");

  res.send(patient);
});

router.delete("/:id", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  let user = patient.user;

  user = await User.findOneAndRemove({ email: user.email });
  await patient.remove();

  if (!user || !patient) return res.status(404).send("No patient found");

  res.send(patient);
});

module.exports = router;
