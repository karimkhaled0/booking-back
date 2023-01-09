import { Router } from "express";

import {
  me,
  getUser,
  updateUser,
  uploadPhoto,
  upload,
} from "./user.controller.js";

const router = Router();

//api/user/me

router.get("/me", me);

// api/user/:id
router.route("/:id").get(getUser).put(updateUser);

router.route("/upload/:id").put(upload.single("photo"), uploadPhoto);
export default router;
