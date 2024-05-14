import express  from "express";
import { IUser } from "../types/IUser.type";
import { AuthService } from "../services/auth.service";
import { IUserConnect } from "../types/IUserConnect.type";
import { IAuthErrorResponse } from "../types/IAuthResponse.type";
import { invalidPasswordOrUsername } from "../errors/errors";

export class authController {
    public static async signup(req: express.Request, res: express.Response): Promise<void>{
        const email = req.body.email 
        const name = req.body.name
        const password = req.body.password

        const newUser: IUser = {
            name: name,
            email: email,
            password: password,
            prizeWon: []
          };
        const response = await AuthService.signup(newUser)
        res.send(response)
    }
    public static async signin(req: express.Request, res: express.Response): Promise<void>{
        const email = req.body.email
        const password = req.body.password

        const connectUser: IUserConnect = {
            email: email,
            password: password
        }
        const response = await AuthService.signin(connectUser)
        if ("error" in response){
            res.status(400).json({ error: invalidPasswordOrUsername });
        } else {
            res.status(200).json(response)
        }
        
    }
}