import express from "express";
import { INewGameReq } from "../types/INewGame.type";
import { GameService } from "../services/game.service";
import { IRollDiceReq } from "../types/IRollDice.type";

export class GameController {
  public static async rollDices(req: express.Request, res: express.Response) : Promise<void> {
    const email = req.body.email;

    const rollDicesReq: IRollDiceReq = {
      email: email,
    };
    const result = await GameService.rollDices(rollDicesReq);
    if ("success" in result) {
        res.send(result).status(200)
    } else {
      res.status(400).json({ error: result.error });
    }
  }

  public static async getResults(req: express.Request, res: express.Response) : Promise<void>{
    const response = await GameService.getResults();
    res.status(200).json(response)
  }
}
