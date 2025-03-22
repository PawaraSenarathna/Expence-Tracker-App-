import express from "express";
import {
  getUserById,
  login,
  register,
  setIncomeGoalById,
  getIncomeGoalById,
  resetIncomeGoalById,
  setExpenseLimitById,
  getExpenseLimitById,
  resetExpenseLimitById,
} from "../controllers/UserController.mjs";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/:id", getUserById);
userRouter.put("/income-goal/:id", setIncomeGoalById);
userRouter.get("/income-goal/:id", getIncomeGoalById);
userRouter.delete("income-goal/:id", resetIncomeGoalById);
userRouter.put("/expense-limit/:id", setExpenseLimitById);
userRouter.get("/expense-limit/:id", getExpenseLimitById);
userRouter.delete("expense-limit/:id", resetExpenseLimitById);

export default userRouter;
