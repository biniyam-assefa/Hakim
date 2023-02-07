const express = require("express");
const app = express();
const doctors = require("./routes/doctors");
const specialities = require("./routes/specialites");
const patients = require("./routes/patients");
const bookings = require("./routes/bookings");
const auth = require("./routes/auth");
const predictor = require("./routes/predictor");
const conversation = require("./routes/conversations");
const message = require("./routes/messages");
const Users = require("./routes/users");
const payments = require("./routes/payments");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

mongoose
  .connect("mongodb://127.0.0.1/hakim")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err.message));

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "/uploads")));

app.use("/api/doctors", doctors);
app.use("/api/specialities", specialities);
app.use("/api/patients", patients);
app.use("/api/bookings", bookings);
app.use("/api/predictor", predictor);
app.use("/api/messages", message);
app.use("/api/Conversations", conversation);
app.use("/api/users", Users);
app.use("/api/payments", payments);

app.use("/api/auth", auth);

app.listen(3000, () => console.log("listening to port 3000"));

const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  //stop consultation message
  socket.on("send-convActivity", (receiverId, isActive) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("receive-convActivity", isActive);
  });
});
