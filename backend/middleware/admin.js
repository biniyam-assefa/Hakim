module.exports = function (req, res, next) {
  if (req.user.userRole !== "Admin")
    return res
      .status(403)
      .send("Access Denied: This task requires admin privilege");

  next();
};
