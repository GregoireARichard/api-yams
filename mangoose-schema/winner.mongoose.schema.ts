import mongoose, { Model, Schema } from "mongoose";
import { IWinner } from "../types/IWinner.type";

const schema = new Schema<IWinner, Model<IWinner>>({
  email: { type: String, required: true },
  prizesWon: { type: Number, required: true },
});

const collectionName = "winners";
const Winner = mongoose.model("Winner", schema, collectionName);

export default Winner;
