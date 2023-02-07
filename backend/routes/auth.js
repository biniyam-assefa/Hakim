const bcrypt = require("bcrypt");
const Express = require("express");
const router = Express.Router();
const _ = require("lodash");
const { User } = require("../models/user");
const Doctors = require("../models/doctor");

router.post("/", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email / User doesnt exist");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  const doc = await Doctors.findOne({ "user._id": user._id });

  if (doc && !doc.isApproved)
    return res
      .status(401)
      .send(
        "Your account is under review. You'll be able to login once your account is approved."
      );

  if (!user.isActive)
    return res.status(401).send("Your account has been banned");

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
