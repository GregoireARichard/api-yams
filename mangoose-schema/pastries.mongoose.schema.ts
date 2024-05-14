import mongoose, { Model, Schema } from "mongoose";
import { IPastries } from "../types/IPastries.type";


const schema = new Schema<IPastries, Model<IPastries>>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  quantityWon: { type: Number, required: true },
});

const collectionName = "pastries";
const Pastries = mongoose.model("Pastries", schema, collectionName);

export default Pastries;
