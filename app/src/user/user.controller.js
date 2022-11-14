import { User } from "./user.model";
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// The storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // folder uploads is outside app folder
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      // file name will be photo-id of the user.whatever the photo format is (which will be png btw)
      file.fieldname + "-" + req.params.id + path.extname(file.originalname)
    );
  },
});

// Filtering the file
const fileFilter = (req, file, cb) => {
  // if the file format is png accept it
  if (file.mimetype === "image/png") {
    cb(null, true);
  }
  // if jpg or jpeg
  if (file.mimetype === "image/jpeg") {
    cb(
      null,
      // change its mimtype
      ((file.mimetype = "image/png"),
      // and the format will be png
      (file.originalname =
        file.originalname.substring(0, file.originalname.indexOf(".j")) +
        ".png"))
    );
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  // limts which have only these sizes
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

export const me = (req, res) => {
  res.status(200).json({ data: req.user });
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).lean().exec();

    if (!user) {
      return res.status(400).end();
    }
    return res.status(200).json({ data: user });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateUser = async (req, res) => {
  try {
    //OWNER
    const ownerId = req.params.id;
    //EXECUTER
    const executerId = req.user._id;
    if (executerId == ownerId) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: ownerId },
        req.body,
        { new: true }
      ).exec();

      if (!updatedUser) {
        return res.status(400).end();
      }
      return res.status(201).json({ data: updatedUser });
    }
    return res
      .status(401)
      .json({ error: "You are not authorized to perform such an action!" });
  } catch (e) {
    res.status(400).end();
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    //OWNER
    const ownerId = req.params.id;
    //EXECUTER
    const executerId = req.user._id;
    if (executerId == ownerId) {
      if (!req.file.filename) {
        return res.status(400).json({ message: "Photo only png or jpg/jpeg" });
      }
      const uploadImage = await User.findByIdAndUpdate(
        { _id: ownerId },
        {
          photo: {
            data: fs.readFileSync(
              // ue proccess.cwd rather __disc
              path.join(process.cwd() + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        },
        { new: true }
      ).exec();
      uploadImage.save((err) => {
        err ? console.log(err) : null;
      });
      if (!uploadImage) {
        return res.status(401).json({ error: "Not authorized" });
      }
      return res.status(200).json({ message: "Photo uploaded successfully" });
    }
    return res
      .status(401)
      .json({ error: "You are not authorized to perform such an action!" });
  } catch (e) {
    console.log("error", e);
    res.status(400).end();
  }
};
