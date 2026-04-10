import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const createToken = (
  payload: {
    id: Types.ObjectId | null;
    email?: string;
    role: string;
    subdomain: string;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  } as jwt.SignOptions);
};
