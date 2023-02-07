const express = require("express");
const _ = require("lodash");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

//get users classified by role
router.get("/all", async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).send(usersByRole);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  try {
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//get user info
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("No user found");
  try {
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//update
router.put("/:userID", async (req, res) => {
  const user = await User.findById(req.params.userID);
  if (!user) return res.status(404).send("No user found");

  if (req.body.email && user.email !== req.body.email) {
    const check = await User.find(
      (user) => user.email.toString() == req.body.email
    );
    if (check)
      return res.status(404).send("An account with this email already exists!");
  }

  if (req.body.newPass && req.body.currentPass) {
    const validPass = await bcrypt.compare(req.body.currentPass, user.password);
    if (!validPass)
      return res.status(400).send("Current password is incorrect!");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPass, salt);
    await user.save();
    res.status(200).send("Password successfully updated!");
  } else {
    try {
      await User.findByIdAndUpdate(user._id, req.body);
      res.status(200).send("Information successfully updated!");
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
});

//add admin
router.post("/admin", async (req, res) => {
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
  newUser.userRole = "Admin";

  try {
    const result = await newUser.save();
    const token = newUser.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(_.pick(result, ["_id", "name", "email"]));
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

module.exports = router;
