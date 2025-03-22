import User from "../models/User.mjs";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log("hit");

  let userExists;
  try {
    userExists = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }
  if (userExists) {
    return res
      .status(400)
      .json({ message: "Email already registered! Please login" });
  }

  const hashedPassword = bcrypt.hashSync(password);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    expenseLimit: 0,
    incomeGoal: 0,
    transactions: [],
  });
  try {
    await user.save();
  } catch (err) {
    return console.log(err);
  }

  return res.status(201).json({ user });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  let userExists;
  try {
    userExists = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }
  if (!userExists) {
    return res
      .status(404)
      .json({ message: "Email not registered! Please sign up" });
  }

  const checkPassword = bcrypt.compareSync(password, userExists.password);
  if (!checkPassword) {
    return res.status(400).json({ message: "Incorrect Password!" });
  }

  return res
    .status(200)
    .json({ message: "Login Successful!", user: userExists });
};

export const getUserById = async (req, res, next) => {
  const userId = req.params.id;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  return res.status(200).json({ user });
};

export const setIncomeGoalById = async (req, res, next) => {
  const { amount } = req.body;
  const userId = req.params.id;
  let record;
  try {
    record = await User.findByIdAndUpdate(userId, {
      incomeGoal: amount,
    });
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(500).json({ message: "Unable to update Income Goal" });
  }

  return res.status(200).json({ record });
};

export const getIncomeGoalById = async (req, res) => {
  const userId = req.params.id;
  let record;
  try {
    record = await User.findById(userId);
  } catch (error) {
    return console.log(err);
  }
  if (!record) {
    return res.status(404).json({ message: "No Records found!" });
  }

  // get Total income
  let userRecords;
  try {
    userRecords = await User.findById({ _id: userId }).populate("records");
  } catch (err) {
    return console.log(err);
  }

  if (!userRecords) {
    return res.status(200).json({ totalIncome: 0, totalExpense: 0 });
  }

  const records = userRecords.records;

  let totalIncome = 0;
  let totalExpense = 0;
  records.map((it) => {
    if (it.type === "income") {
      totalIncome += it.amount;
    } else {
      totalExpense += it.amount;
    }
  });

  if (record.incomeGoal === 0)
    return res.status(200).json({ incomeGoal: 0, presentage: 0 });

  const presentage = Math.round((totalIncome / record.incomeGoal) * 100);
  return res.status(200).json({ incomeGoal: record.incomeGoal, presentage });
};

export const resetIncomeGoalById = async (req, res, next) => {
  const userId = req.params.id;
  let record;
  try {
    record = await User.findByIdAndUpdate(userId, {
      incomeGoal: 0,
    });
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(500).json({ message: "Unable to update Income Goal" });
  }

  return res.status(200).json({ record });
};

export const setExpenseLimitById = async (req, res, next) => {
  const { limit } = req.body;
  const userId = req.params.id;
  let record;
  try {
    record = await User.findByIdAndUpdate(userId, {
      expenseLimit: limit,
    });
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(500).json({ message: "Unable to update expense limit" });
  }

  return res.status(200).json({ record });
};

export const getExpenseLimitById = async (req, res) => {
  const { limit } = req.body;
  const userId = req.params.id;
  let record;
  try {
    record = await User.findById(userId);
  } catch (error) {
    return console.log(err);
  }
  if (!record) {
    return res.status(404).json({ message: "No Records found!" });
  }
  return res.status(200).json({ expenseLimit: record.expenseLimit });
};

export const resetExpenseLimitById = async (req, res, next) => {
  const userId = req.params.id;
  let record;
  try {
    record = await User.findByIdAndUpdate(userId, {
      expenseLimit: 0,
    });
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(500).json({ message: "Unable to update Income Goal" });
  }

  return res.status(200).json({ record });
};
