import bcrypt from "bcrypt";

export class utils {
  public static async encryptPassword(pwd: string, rounds: number) {
    return await bcrypt.hash(pwd, rounds);
  }
}
