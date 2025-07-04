import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();


const allowedOrigins = [
  "https://warp-events.vercel.app", // Production frontend
  "http://localhost:5173", // Dev frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// middleware for json data
app.use(express.json({ limit: "16kb" }));

// if data come from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// to read and set cookie to browser
app.use(cookieParser());

// routes  ----------------

import userRouter from "./routers/user.routes.js";
import eventRouter from "./routers/event.route.js";

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/events", eventRouter);


app.use(errorHandler);
export { app };
