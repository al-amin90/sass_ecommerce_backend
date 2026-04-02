import { Model } from "mongoose";

export interface IUser {
  id: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;
  role: "admin" | "user" | "super_admin";
  status: "blocked" | "in-progress";
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
