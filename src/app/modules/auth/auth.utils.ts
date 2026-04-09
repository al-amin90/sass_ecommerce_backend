import jwt from "jsonwebtoken";

export const createToken = (
  payload: { email?: string; role: string; subdomain: string },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};
