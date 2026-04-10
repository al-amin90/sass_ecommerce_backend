import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

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

export type TUserRole = keyof typeof USER_ROLE;
