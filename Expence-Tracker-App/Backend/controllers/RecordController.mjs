import mongoose from "mongoose";
import Record from "../Models/Record.mjs";
import User from "../models/User.mjs";
import sendExpenseLimitEmail from "../utils/sendExpenseLimitEmail.mjs";

export const createRecord = async (req, res, next) => {
  const { label, note, amount, type, category, timestamp, user } = req.body;

  let userExists;
  try {
    userExists = await User.find({ _id: user });
  } catch (err) {
    return console.log(err);
  }

  if (!userExists) {
    return res.status(400).json({ message: "User not found!" });
  }

  // Check expense limit
  let userRecords;
  try {
    userRecords = await User.findById({ _id: user }).populate("records");
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

  sendExpenseLimitEmail(
    userExists[0].expenseLimit,
    totalExpense,
    userExists[0].email
  );

  const record = new Record({
    label,
    note,
    amount,
    type,
    category,
    timestamp,
    user,
  });

  // From external api fetch

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await record.save({ session });
    userExists[0].records.push({ _id: record.id });
    await userExists[0].save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ record });
};

export const updateRecord = async (req, res, next) => {
  const { label, note, amount, type, category, timestamp } = req.body;
  const recordId = req.params.id;

  let record;
  try {
    record = await Record.findByIdAndUpdate(recordId, {
      label,
      note,
      amount,
      type,
      category,
      timestamp,
    });
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(500).json({ message: "Unable to update record" });
  }

  return res.status(200).json({ record });
};

export const deleteRecord = async (req, res, next) => {
  console.log("hit backend");

  const recordId = req.params.id;
  let record;
  try {
    // Use findByIdAndDelete instead of findByIdAndRemove
    record = await Record.findByIdAndDelete(recordId).populate("user");

    if (!record) {
      return res.status(404).json({ message: "Record not found!" });
    }

    // Remove the record reference from the user's records array
    await User.updateOne(
      { _id: record.user._id },
      { $pull: { records: record._id } }
    );

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }

  return res.status(200).json({ message: "Record deleted!" });
};

export const getRecordnById = async (req, res, next) => {
  const recordId = req.params.id;

  let record;
  try {
    record = await Record.findById(recordId);
  } catch (err) {
    return console.log(err);
  }

  if (!record) {
    return res.status(404).json({ message: "Record not found!" });
  }

  return res.status(200).json({ record });
};

export const getRecordsByUserId = async (req, res, next) => {
  const userId = req.params.id;

  let userRecords;
  try {
    userRecords = await User.findById(userId).populate("records");
  } catch (err) {
    return console.log(err);
  }

  if (!userRecords) {
    return res.status(404).json({ message: "No Records found!" });
  }

  return res.status(200).json({ records: userRecords });
};

export const getBalanceByUserId = async (req, res, next) => {
  const userId = req.params.id;

  let userRecords;
  try {
    userRecords = await User.findById(userId).populate("records");
  } catch (err) {
    return console.log(err);
  }

  if (!userRecords) {
    return res.status(200).json({ balance: 0 });
  }

  let balance = 0;
  userRecords.records.map((it) => {
    balance += it.amount;
  });

  return res.status(200).json({ balance: balance });
};

export const getTotalIncomeAndExpense = async (req, res, next) => {
  const userId = req.params.id;

  let userRecords;
  try {
    userRecords = await User.findById(userId).populate("records");
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

  return res
    .status(200)
    .json({ totalIncome: totalIncome, totalExpense: totalExpense });
};

export const getIncomeDetails = async (req, res, next) => {
  const userId = req.params.id;

  let userRecords;
  try {
    userRecords = await User.findById(userId).populate("records");
  } catch (err) {
    return console.log(err);
  }

  if (!userRecords) {
    return res.status(200).json({
      allowance: 0,
      commission: 0,
      gifts: 0,
      interests: 0,
      investments: 0,
      salary: 0,
      selling: 0,
      miscellaneous: 0,
    });
  }

  const records = userRecords.records;

  let allowance = 0;
  let commission = 0;
  let gifts = 0;
  let interests = 0;
  let investments = 0;
  let salary = 0;
  let selling = 0;
  let miscellaneous = 0;

  const incomeJSON = records.filter((it) => it.type === "income");

  incomeJSON.map((it) => {
    if (it.category === "allowance") {
      allowance += it.amount;
    } else if (it.category === "comission") {
      commission += it.amount;
    } else if (it.category === "gifts") {
      gifts += it.amount;
    } else if (it.category === "interests") {
      interests += it.amount;
    } else if (it.category === "investments") {
      investments += it.amount;
    } else if (it.category === "salary") {
      salary += it.amount;
    } else if (it.category === "selling") {
      selling += it.amount;
    } else if (it.category === "misc-income") {
      miscellaneous += it.amount;
    }
  });

  return res.status(200).json({
    allowance: allowance,
    commission: commission,
    gifts: gifts,
    interests: interests,
    investments: investments,
    salary: salary,
    selling: selling,
    miscellaneous: miscellaneous,
  });
};

export const getExpenseDetails = async (req, res, next) => {
  const userId = req.params.id;

  let userRecords;
  try {
    userRecords = await User.findById(userId).populate("records");
  } catch (err) {
    return console.log(err);
  }

  if (!userRecords) {
    return res.status(200).json({
      bills: 0,
      clothing: 0,
      entertainment: 0,
      food: 0,
      purchases: 0,
      subscriptions: 0,
      transportation: 0,
      miscellaneous: 0,
    });
  }

  const records = userRecords.records;

  let bills = 0;
  let clothing = 0;
  let entertainment = 0;
  let food = 0;
  let purchases = 0;
  let subscriptions = 0;
  let transportation = 0;
  let miscellaneous = 0;
  const expenseJSON = records.filter((it) => it.type === "expense");

  expenseJSON.map((it) => {
    if (it.category === "bills") {
      bills += it.amount;
    } else if (it.category === "clothing") {
      clothing += it.amount;
    } else if (it.category === "entertainment") {
      entertainment += it.amount;
    } else if (it.category === "food") {
      food += it.amount;
    } else if (it.category === "purchases") {
      purchases += it.amount;
    } else if (it.category === "subscriptions") {
      subscriptions += it.amount;
    } else if (it.category === "transportation") {
      transportation += it.amount;
    } else if (it.category === "misc-expense") {
      miscellaneous += it.amount;
    }
  });

  return res.status(200).json({
    bills: bills * -1,
    clothing: clothing * -1,
    entertainment: entertainment * -1,
    food: food * -1,
    purchases: purchases * -1,
    subscriptions: subscriptions * -1,
    transportation: transportation * -1,
    miscellaneous: miscellaneous * -1,
  });
};

export const createRecordByOCR = async (req, res, next) => {
  console.log("hit backend");
  const { timestamp, user, ocrData } = req.body;

  const label = "AI generated record";
  const note = "AI generated record";
  const type = "expense";
  let amount = 0;
  let category = "";

  const text = ocrData.ParsedResults[0].ParsedText;

  try {
    const response = await fetch("http://localhost:3333/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }), // Sending extracted text
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    console.log(responseData);

    if (responseData.category && responseData.price !== undefined) {
      amount = responseData.price * -1;
      
      if(responseData.category === "CLOTHING"){
        category = "clothing";
      }

      if(responseData.category === "ENTERTAINMENT"){
        category = "entertainment";

      }

      if(responseData.category === "FOOD AND DRINKS"){
        category = "food";

      }

      if(responseData.category === "PURCHASES"){
        category = "purchases";

      }

      if(responseData.category === "SUBCRIPTIONS"){
        category = "subscriptions";

      }

      if(responseData.category === "TRANSPORTATION"){
        category = "transportation";

      }

      if(responseData.category === "MISCELLANEOUS"){
        category = "misc-expense";

      }

    } else {
      throw new Error("Category or price not found in the response.");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  let userExists;
  try {
    userExists = await User.find({ _id: user });
  } catch (err) {
    return console.log(err);
  }

  if (!userExists) {
    return res.status(400).json({ message: "User not found!" });
  }

  // Check expense limit
  let userRecords;
  try {
    userRecords = await User.findById({ _id: user }).populate("records");
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

  sendExpenseLimitEmail(
    userExists[0].expenseLimit,
    totalExpense,
    userExists[0].email
  );

  const record = new Record({
    label,
    note,
    amount,
    type,
    category,
    timestamp,
    user,
  });

  // From external api fetch

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await record.save({ session });
    userExists[0].records.push({ _id: record.id });
    await userExists[0].save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
  return res.status(200).json({ record });
};