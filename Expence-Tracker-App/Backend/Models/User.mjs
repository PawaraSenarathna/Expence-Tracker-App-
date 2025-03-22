import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  expenseLimit: {
    type: Number,
    required: true,
  },
  incomeGoal: {
    type: Number,
    required: true,
  },
  records: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Record",
      required: true,
    },
  ],
});

export default mongoose.model("User", userSchema);
