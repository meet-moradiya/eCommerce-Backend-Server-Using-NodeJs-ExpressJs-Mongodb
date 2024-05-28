const multer = require("multer");
const uudi = require("uuid");

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "uploads");
  },
  filename(req, file, callback) {
    const id = uudi.v4();
    const extName = file.originalname.split(".").pop();
    callback(null, `${id}.${extName}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
