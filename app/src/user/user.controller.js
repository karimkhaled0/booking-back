import { User } from "./user.model";
import { Category } from "../category/category.model";
import { verifyToken } from "../../utils/auth";
import bcrypt from "bcryptjs";
import { Task } from "../task/task.model";

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
