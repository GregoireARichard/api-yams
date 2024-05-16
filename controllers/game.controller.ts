import express from "express";
import { GameService } from "../services/game.service";
import { IRollDiceReq } from "../types/IRollDice.type";
import jwt from 'jsonwebtoken';
import { SIGNING } from "../services/auth.service";

export class GameController {
  public static async rollDices(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        res.status(401).json({ error: 'Missing authorization header' });
        return;
      }
  
      const token = authorizationHeader.split(' ')[1];
      const SIGNING_KEY = typeof SIGNING === 'string' ? SIGNING : ""
      const decoded: any = jwt.verify(token, SIGNING_KEY);

      const email = decoded.email;
  
      const rollDicesReq: IRollDiceReq = {
        email: email,
      };
      const result = await GameService.rollDices(rollDicesReq);
      if ('success' in result) {
        res.send(result).status(200);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  public static async getResults(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const response = await GameService.getResults();
    res.status(200).json(response);
  }
}
