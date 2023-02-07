module.exports = function (req, res, next) {
  if (req.user.userRole !== "Doctor")
    return res
      .status(403)
      .send("Access Denied: This task requires you to be a Doctor");

  next();
};
