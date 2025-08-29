import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/Database.js";
import authRouter from "./routes/AuthRoutes.js";
import userRouter from "./routes/UserRoute.js";

const app = express();
const port = process.env.PORT || 4000; //if env has port then use that otherwise use 4000
connectDB(); //to connect with the database established in config/database

const allowedOrigins = "http://localhost:5173";

app.use(express.json()); //Converts JSON data from client requests into JavaScript objects
app.use(cookieParser()); //needed for reading and writing cookies
app.use(cors({ origin: allowedOrigins, credentials: true })); //without these, cookies wouldn't be sent/received across different origins (like frontend on localhost:3000, backend on localhost:5000)

app.get("/", (req, res) => {
  res.send("Api working fine");
});

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server is listening on PORT: ${port}`);
});
