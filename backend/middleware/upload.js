const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname);
    cb(null, req.body.fname + "-" + file.fieldname + "-" + uniqueSuffix + ext);
  },
});

var upload = multer({ storage: storage });

module.exports = upload;
