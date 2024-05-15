import mongoose from "mongoose";
import User from "../mangoose-schema/user.mongoose.schema";
import { IUser } from "../types/IUser.type";
import { IUserConnect } from "../types/IUserConnect.type";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { IWinner } from "../types/IWinner.type";
import Winner from "../mangoose-schema/winner.mongoose.schema";
import { IGames } from "../types/IGames.type";
import Game from "../mangoose-schema/games.mongoose.schema";
import Pastries from "../mangoose-schema/pastries.mongoose.schema";
import { IResponsePastries } from "../types/IResponsePastries.type";
import { errorCouldNotCreateUser } from "../errors/errors";
dotenv.config();

const password = process.env.MONGOPASSWORD;
const username = process.env.MONGOUSERNAME;
const mongoUri = `mongodb://${username}:${password}@127.0.0.1:27017/yams?authSource=admin`;

export class MongooseAdapter {
  public static async createUser(user: IUser) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");

      const newUser = new User(user);

      await newUser.save();
      console.log("User saved to database:", newUser);

      return { success: "User created" };
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      return { error: errorCouldNotCreateUser };
    }
  }
  public static async connectUser(user: IUserConnect): Promise<boolean> {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");

      const foundUser: IUser | null = await User.findOne({
        email: user.email,
      }).exec();

      if (foundUser) {
        return await bcrypt.compare(user.password, foundUser.password);
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  public static async hasUserAlreadyWon(email: string): Promise<boolean> {
    try {
      await mongoose.connect(mongoUri);
      const foundWinner: IWinner | null = await Winner.findOne({
        email: email,
      });
      return foundWinner != null;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async hasUserAlreadyPlayed(email: string): Promise<boolean> {
    try {
      await mongoose.connect(mongoUri);
      const game: IGames | null = await Game.findOne({
        usermail: email,
      });
      if (game?.numberPlayed != undefined && game?.numberPlayed > 2) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  public static async createGameOrUpdateGame(
    email: string,
    score: number[]
  ): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      const existingGame = await Game.findOne({ usermail: email });

      if (existingGame) {
        await Game.updateOne(
          { usermail: email },
          {
            $inc: { numberPlayed: 1 },
            $push: { score: { $each: [score] } },
          }
        ).exec();
      } else {
        await Game.create({
          usermail: email,
          numberPlayed: 1,
          score: [score],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  public static async increaseRolledTime(email: string): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      const game: IGames | null = await Game.findOne({
        email: email,
      });
      if (game && game.numberPlayed < 3) {
        await Game.findOneAndUpdate(
          { email: email },
          { numberPlayed: game.numberPlayed + 1 }
        ).exec();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public static async insertWinner(
    email: string,
    prizes: number
  ): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      await Winner.create({
        email: email,
        prizesWon: prizes,
      });
    } catch (error) {
      console.log(error);
    }
  }

  public static async deleteWinner(email: string): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      await Winner.deleteOne({
        email: email,
      });
    } catch (error) {
      console.log(error);
    }
  }
  private static async removeFromStock(
    prize: number,
    pastryId: string
  ): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      // remove prize number and add quantityWon from pastryID
      await Pastries.updateOne(
        { _id: pastryId },
        {
          $inc: {
            stock: -prize,
            quantityWon: prize,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
  public static async getPastriesFromStock(
    prize: number
  ): Promise<IResponsePastries[]> {
    let neededPastry = prize;
    let wonPastries: IResponsePastries[] = [];
    try {
      await mongoose.connect(mongoUri);
      const foundPastries = await Pastries.find({ stock: { $gt: 0 } });

      if (prize <= 0) {
        return [];
      }

      if (foundPastries[0] && foundPastries[0].stock >= prize) {
        neededPastry -= foundPastries[0].stock;
        this.removeFromStock(prize, foundPastries[0].id);
        wonPastries.push({
          name: foundPastries[0].name,
          stockWon: prize,
          imageLink: foundPastries[0].image,
        });
      } else if (foundPastries[0] && foundPastries[0].stock < prize) {
        // it removes stock by iterating over pastries that have stock left
        foundPastries.map((pastry) => {
          if (neededPastry > 0 && pastry.stock > 0) {
            this.removeFromStock(pastry.stock, pastry.id);
            wonPastries.push({
              name: pastry.name,
              stockWon: prize,
              imageLink: pastry.image,
            });
            neededPastry -= pastry.stock;
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
    return wonPastries;
  }

  public static async getWinners(): Promise<IWinner[]> {
    const winners: IWinner[] = [];
    try {
      await mongoose.connect(mongoUri);
      const foundWinners = await Winner.find({});
      if (foundWinners) {
        foundWinners.map((winner) => {
          winners.push({ email: winner.email, prizesWon: winner.prizesWon });
        });
      }
    } catch (error) {
      console.log(error);
    }
    return winners;
  }

  public static async deleteGame(email: string): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      const result = await Game.deleteOne({
        usermail: email,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
