import { Router } from "express";

import { me, getUser, updateUser } from "./user.controller";

const router = Router();

//api/user/me

router.get("/me", me);

// api/user/:id
router.route("/:id").get(getUser).put(updateUser);

export default router;
