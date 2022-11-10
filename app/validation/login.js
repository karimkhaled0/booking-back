import Validator from "validator";
import isEmpty from "./isEmpty";

import { User } from "../src/user/user.model";

export const validateLoginInput = async (data) => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  const existUser = await User.findOne({ email: data.email }).exec();

  if (!existUser) {
    errors.email = "You have to register first in order to signin!";
  } else {
    const match = await existUser.checkPassword(data.password);
    if (!match) {
      errors.password = "incorrect password!";
    }
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
