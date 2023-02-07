const express = require("express");
const router = express.Router();
const { Speciality } = require("../models/speciality");

router.get("/", async (req, res) => {
  try {
    const special = await Speciality.find();
    res.send(special);
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const special = await Speciality.findById(req.params.id);
  if (!special) return res.status(404).send("No speciality found");
  res.send(special);
});

router.post("/", async (req, res) => {
  const newSpecial = await new Speciality({
    name: req.body.name,
  });

  try {
    const result = await newSpecial.save();
    res.send(result);
  } catch (err) {
    res.send(err.message);
  }
});

router.put("/:id", async (req, res) => {
  const special = await Speciality.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!special) return res.status(404).send("No speciality found");

  res.send(special);
});

router.delete("/:id", async (req, res) => {
  const special = await Speciality.findByIdAndRemove(req.params.id);

  if (!special) return res.status(404).send("No speciality found");

  res.send(special);
});

module.exports = router;
