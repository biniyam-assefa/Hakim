const mongoose = require("mongoose");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://127.0.0.1/hakim")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err.message));

const newAdminUser = new User({
  fname: "Admin",
  lname: "admin",
  email: "admin@hakim.et",
  password: "password",
  userRole: "Admin",
  phoneNumber: "0909090909",
  gender: "Male",
  birthdate: new Date(1980, 1, 1),
});

const saveUser = async () => {
  const salt = await bcrypt.genSalt(10);
  newAdminUser.password = await bcrypt.hash("password", salt);

  newAdminUser
    .save()
    .then((user) => console.log("Admin user added:", user))
    .catch((err) => console.log("Error adding admin user:", err.message));
};

saveUser();
