import jwt from "jsonwebtoken";
import { MongooseAdapter } from "../repository/mongoose.adapter";
import {
  IAuthErrorResponse,
  IAuthSuccessResponse,
} from "../types/IAuthResponse.type";
import { IUser } from "../types/IUser.type";
import { IUserConnect } from "../types/IUserConnect.type";
import { utils } from "../utils/bcrypt.utils";
import { ISignUpResponse } from "../types/ISignUpResponse.type";
import { errorCouldNotCreateUser, errorUnauthorized } from "../errors/errors";

const ADMIN_AUD = "api-yums";
const ISSUER = "api-auth";
const SIGNING = process.env.PUB_KEY;

export class AuthService {
  private static generateJwt(email: string): string {
    const encoded = jwt.sign(
      {
        email: email,
      },
      SIGNING ? SIGNING : "",
      {
        expiresIn: "30 minutes",
        audience: ADMIN_AUD,
        issuer: ISSUER,
      }
    );
    return encoded;
  }
  public static async signup(user: IUser): Promise<ISignUpResponse> {
    const encryptedPassword = await utils.encryptPassword(user.password, 10);
    user.password = encryptedPassword.toString();
    const createdUser = await MongooseAdapter.createUser(user);

    const jwt = this.generateJwt(user.email);
    let response: ISignUpResponse = {
      success: createdUser.success,
      error: undefined,
      jwt: jwt,
    };
    if (createdUser.error) {
      response = {
        success: undefined,
        error: errorCouldNotCreateUser,
        jwt: undefined,
      };
    }

    return response;
  }
  public static async signin(
    user: IUserConnect
  ): Promise<IAuthSuccessResponse | IAuthErrorResponse> {
    const canBeConnected = await MongooseAdapter.connectUser(user);
    if (canBeConnected) {
      const encoded = this.generateJwt(user.email);
      return { jwt: encoded };
    } else {
      return { error: errorUnauthorized };
    }
  }
}
