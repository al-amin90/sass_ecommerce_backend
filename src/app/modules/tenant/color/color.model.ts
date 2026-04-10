import { model, Schema } from "mongoose";

import AppError from "../../../errors/AppError";
import status from "http-status";
import { TCalor } from "./color.interface";

const colorSchema = new Schema<TCalor>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    color: {
      type: String,
    },
  },
);

export default colorSchema;
