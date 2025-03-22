import express from "express";
import {
  createRecord,
  createRecordByOCR,
  updateRecord,
  deleteRecord,
  getRecordnById,
  getRecordsByUserId,
  getBalanceByUserId,
  getTotalIncomeAndExpense,
  getIncomeDetails,
  getExpenseDetails,
} from "../controllers/RecordController.mjs";

const recordRouter = express.Router();

recordRouter.post("/create", createRecord);
recordRouter.post("/createByOCR", createRecordByOCR);
recordRouter.put("/update/:id", updateRecord);
recordRouter.delete("/:id", deleteRecord);
recordRouter.get("/:id", getRecordnById);
recordRouter.get("/user/:id", getRecordsByUserId);
recordRouter.get("/user/:id/balance", getBalanceByUserId);
recordRouter.get("/user/:id/data", getTotalIncomeAndExpense);
recordRouter.get("/user/:id/income", getIncomeDetails);
recordRouter.get("/user/:id/expense", getExpenseDetails);

export default recordRouter;
