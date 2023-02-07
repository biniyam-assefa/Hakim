const express = require("express");
const router = express.Router();
const { subSpeciality } = require("../models/subSpeciality");
const { Speciality } = require("../models/speciality");

router.get("/", async (req, res) => {
  try {
    const subSpecial = await subSpeciality.find();
    res.send(subSpecial);
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const subSpecial = await subSpeciality.findById(req.params.id);
  if (!subSpecial) return res.status(404).send("No Sub - Speciality found");
  res.send(subSpecial);
});

router.post("/", async (req, res) => {
  const special = await Speciality.findById(req.body.specialID);
  if (!special) return res.status(400).send("Invalid Sub - Speciality ID");

  const newSubSpecial = await new subSpeciality({
    name: req.body.name,
    speciality: {
      _id: special._id,
      name: special.name,
    },
  });

  try {
    const result = await newSubSpecial.save();
    res.send(result);
  } catch (err) {
    res.send(err.message);
  }
});

router.put("/:id", async (req, res) => {
  const subSpecial = await subSpeciality.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!subSpecial) return res.status(404).send("No sub - speciality found");

  res.send(subSpecial);
});

router.delete("/:id", async (req, res) => {
  const subSpecial = await subSpeciality.findByIdAndRemove(req.params.id);

  if (!subSpecial) return res.status(404).send("No sub - speciality found");

  res.send(subSpecial);
});

module.exports = router;
