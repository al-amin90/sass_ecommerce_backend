import { NextFunction, Request, RequestHandler, Response } from "express";
import fs from "fs";

const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(err);
    });
  };
};

export default catchAsync;
