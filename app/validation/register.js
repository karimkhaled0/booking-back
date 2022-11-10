import Validator from "validator";
import isEmpty from "./isEmpty";
import { User } from "../src/user/user.model";

export const validateRegisterInput = async (data) => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  const existEmail = await User.findOne({ email: data.email }).lean().exec();

  const existName = await User.findOne({ name: data.name }).lean().exec();

  if (existEmail) {
    errors.email = "email is already exist";
  }
  if (existName) {
    errors.name = "Name is already exist";
  }

  if (!Validator.isLength(data.name, { min: 3, max: 30 })) {
    errors.name = "Name Must be between 3 and 30 characters!";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required !";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required !";
  }

  if (!Validator.isLength(data.password, { min: 8, max: 16 })) {
    errors.password = "Password must be between 8 and 16 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = " Confirm Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
