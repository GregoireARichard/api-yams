import { IResponsePastries } from "./IResponsePastries.type";

export interface IRollDiceReq {
  email: string;
}
export interface IRollDiceRes {
  error?: string;
  success?: string;
  dice: number[];
  prize: IResponsePastries[];
}
