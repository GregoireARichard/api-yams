import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../types/IUser.type";

const schema = new Schema<IUser, Model<IUser>>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  prizeWon: { type: [String], required: false },
});

const collectionName = "users";
const User = mongoose.model("User", schema, collectionName);

export default User;
