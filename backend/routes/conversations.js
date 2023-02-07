const router = require("express").Router();
const Conversation = require("../models/conversation");
const Booking = require("../models/booking");
const { User } = require("../models/user");

//all convos
router.get("/", async (req, res) => {
  try {
    const conv = await Conversation.find();
    res.send(conv);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//new conv
router.post("/", async (req, res) => {
  const book = await Booking.findById(req.body.booking);
  if (!book) return res.status(400).send("No booking found with that ID");

  const newConversation = new Conversation({
    members: [req.body.doctorID, req.body.patientID],
    booking: req.body.booking,
  });

  const doc = await User.findById(req.body.doctorID);
  const pat = await User.findById(req.body.patientID);

  if (doc.userRole !== "Doctor" && pat.userRole !== "Patient")
    return res
      .status(400)
      .send(
        "Only doctors and patients are allowed to have conversations with each other"
      );

  try {
    const savedConversation = await newConversation.save();
    res.status(200).send(savedConversation);
  } catch (err) {
    res.status(500).send(err);
  }
});

// stop and start consultation
router.put("/:convID", async (req, res) => {
  const conversation = await Conversation.findByIdAndUpdate(
    req.params.convID,
    {
      isActive: req.body.isActive,
      wasActive: req.body.wasActive,
    },
    { new: true }
  );

  if (!conversation) return res.status(404).send("No conversation found");

  res.send(conversation);
});

//get conv of a user
router.get("/:userID", async (req, res) => {
  const user = await User.findById(req.params.userID);
  if (!user) return res.status(400).send("User with this ID does not exist!");
  try {
    const conversation = await Conversation.find({
      members: { $in: [user._id] },
    });
    res.status(200).send(conversation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  const user1 = await User.findById(req.params.firstUserId);
  if (!user1)
    return res.status(400).send("User with the first ID does not exist!");

  const user2 = await User.findById(req.params.secondUserId);
  if (!user2)
    return res.status(400).send("User with the second ID does not exist!");
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [user1._id, user2._id] },
    });
    res.status(200).send(conversation);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
