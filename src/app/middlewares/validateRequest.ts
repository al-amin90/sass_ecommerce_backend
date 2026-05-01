import { NextFunction, Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({ body: req.body, cookies: req.cookies });
    return next();
  });
};

export default validateRequest;
