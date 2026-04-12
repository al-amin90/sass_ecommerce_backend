import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname);
  },
});

export const upload = multer({ storage });
