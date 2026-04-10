import { model, Schema } from "mongoose";

import AppError from "../../../errors/AppError";
import status from "http-status";
import { TCategory } from "./category.interface";

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// categorySchema.pre("save", async function () {
//   const isExist = await this.findOne({ name: this.name });

//   if (isExist) {
//     throw new AppError(status.CONFLICT, "This Category iss already exist");
//   }
// });

export default categorySchema;
