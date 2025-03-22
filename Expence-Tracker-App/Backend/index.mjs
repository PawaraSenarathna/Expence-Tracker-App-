import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/UserRoutes.mjs";
import recordRouter from "./routes/recordRoutes.mjs";
import connectDB from "./config/database.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use("/api/user", userRouter);
app.use("/api/records", recordRouter);

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`CONNECTED TO PORT ${PORT}`));
