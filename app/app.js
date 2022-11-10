import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { config } from "./config/dev";
import { json, urlencoded } from "body-parser";
import userRouter from "./src/user/user.router";
import { signin, signup, protect } from "./utils/auth";
import * as http from "http";
// app setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

app.use(cors());

//body-parser setup
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(morgan("dev"));

//routes
app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/signup", signup);
app.post("/signin", signin);
app.use("/api", protect);
app.use("/api/user", userRouter);

mongoose
  .connect(config.secrets.dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb is connected!!");
    server.listen(PORT, () => {
      console.log(`server is runing on port ${PORT}`);
    });
  })
  .catch((e) => console.log(e));
