import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  passwordReset,
  register,
  sendVerifyOtp,
  setResetOtp,
  verifyEmail,
} from "../controller/AuthController.js";
import { userAuth } from "../middleware/UserAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/sendVerifyOTP", userAuth, sendVerifyOtp);
authRouter.post("/verifyEmail", userAuth, verifyEmail);
authRouter.get("/isAuthenticated", userAuth, isAuthenticated);
authRouter.post("/setResetOtp", setResetOtp);
authRouter.post("/passwordReset", passwordReset);

export default authRouter;
