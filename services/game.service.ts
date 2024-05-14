import { MongooseAdapter } from "../repository/mongoose.adapter";
import { errorUserHasAlreadyPlayedOrwin } from "../errors/errors";
import { ICombination } from "../types/ICombination.type";
import { INewGameReq } from "../types/INewGame.type";
import { IResponsePastries } from "../types/IResponsePastries.type";
import { IRollDiceReq, IRollDiceRes } from "../types/IRollDice.type";
import { IWinner } from "../types/IWinner.type";

export class GameService {

  public static async rollDices(user: IRollDiceReq): Promise<IRollDiceRes> {
    if (await MongooseAdapter.hasUserAlreadyWon(user.email) || await MongooseAdapter.hasUserAlreadyPlayed(user.email) ) {
      return {
        error: errorUserHasAlreadyPlayedOrwin,
        dice: [],
        prize: []
      }
    }

    const diceResArr: number[] = [];
    for (let i = 0; i <= 4; i++) {
      const randomNumber: number = Math.floor(Math.random() * 6) + 1;
      diceResArr.push(randomNumber);
    }
    //create or update game 
    await MongooseAdapter.createGameOrUpdateGame(user.email, diceResArr)

    // win logic
    // if diceResArr contains one of the possible combinations -> inserts into winners
    const { isWinning, numberOfPrizes: prize } = this.isCombinationWinning(diceResArr);
    if (isWinning) {
     await MongooseAdapter.insertWinner(user.email, prize);
    }

    // query pastries to change the numbers of pasties won and left
    let finalPrize: IResponsePastries[] = []
    if(prize > 0){
     finalPrize = await MongooseAdapter.getPastriesFromStock(prize)
    }

    return {
      success: "ok",
      dice: diceResArr,
      prize: finalPrize,
    };
  }
  public static isCombinationWinning(combo: number[]): ICombination {
    let result: ICombination = {
      isWinning: false,
      numberOfPrizes: 0,
    };
    // YAM'S (5/5 dés identiques 🎲🎲🎲🎲🎲) :
    // L'utilisateur se verra attribuer immédiatement 3 pâtisseries.
    if (this.isYams(combo)) {
      return (result = {
        isWinning: true,
        numberOfPrizes: 3,
      });
    }

    // CARRÉ (4/5 dés identiques 🎲🎲🎲🎲) :
    // L'utilisateur se verra attribuer immédiatement 2 pâtisseries.
    if (this.isSquared(combo)) {
      return (result = {
        isWinning: true,
        numberOfPrizes: 2,
      });
    }

    // DOUBLE (2 paires de dés identiques 🎲🎲 + 🎲🎲) :
    // L'utilisateur se verra attribuer immédiatement 1 pâtisserie.
    if (this.isDouble(combo)) {
      return (result = {
        isWinning: true,
        numberOfPrizes: 1,
      });
    }

    return result;
  }
  public static isYams(combo: number[]): boolean {
    for (let i = 1; i <= 4; i++) {
      if (combo[i] != combo[0]) return false;
    }
    return true;
  }

  public static isSquared(combo: number[]): boolean {
    let obj: any = {};

    for (const dice of combo) {
      obj[dice] ? (obj[dice] += 1) : (obj[dice] = 1);
    }

    if (Object.keys(obj).length === 2) {
      return true;
    }

    return false;
  }

  public static isDouble(combo: number[]): boolean {
    const countMap: Map<number, number> = new Map();

    for (const num of combo) {
      const count = countMap.get(num) || 0;
      countMap.set(num, count + 1);
    }

    let doubleCount = 0;
    for (const count of countMap.values()) {
      if (count === 2) {
        doubleCount++;
      }
      if (count > 2) {
        return false;
      }
    }
    return doubleCount === 2;
  }

  public static async getResults(): Promise<IWinner[]>{
    const winners = await MongooseAdapter.getWinners()
    return winners
  }
}