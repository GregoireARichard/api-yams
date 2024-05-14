import mongoose, { Model, Schema } from "mongoose";
import { IGames } from "../types/IGames.type";

const schema = new Schema<IGames, Model<IGames>>({
  usermail: { type: String, required: true },
  numberPlayed: { type: Number, required: true },
  score: { type: [[Number]], required: true },
});

const collectionName = "games";
const Game = mongoose.model("Game", schema, collectionName);

export default Game;
