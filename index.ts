import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authController } from "./controllers/auth.controller";
import { GameController } from "./controllers/game.controller";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/auth/signup", authController.signup);
app.post("/auth/signin", authController.signin);

app.post("/game/roll-dices", GameController.rollDices);
app.get("/game/results", GameController.getResults);
