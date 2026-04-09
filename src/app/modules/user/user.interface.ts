import { Model } from "mongoose";

export interface IUser {
  password: string;
  email: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;
  role: "admin" | "user" | "super_admin";
  isActive: Boolean;
}

export interface IUserModel extends Model<IUser> {
  isUserExistByCustomId(id: string): Promise<IUser> | null;
  isPasswordMatch(
    planTextPassword: string,
    hashTextPassword: string,
  ): Promise<IUser> | null;
  isJWTIssuedBeforePassword(
    passwordChangeTimeStamp: Date,
    jwtIssuedTimeStamp: number,
  ): boolean;
}
