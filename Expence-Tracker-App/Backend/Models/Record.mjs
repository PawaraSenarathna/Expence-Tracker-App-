import mongoose from "mongoose";

const Schema = mongoose.Schema;

const recordSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Record", recordSchema);
