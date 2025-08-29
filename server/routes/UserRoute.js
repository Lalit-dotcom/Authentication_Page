import express from "express";
import { userAuth } from "../middleware/UserAuth.js";
import { getUserData } from "../controller/UserController.js";

const userRouter = express.Router();

userRouter.get("/userDetails", userAuth, getUserData);

export default userRouter;