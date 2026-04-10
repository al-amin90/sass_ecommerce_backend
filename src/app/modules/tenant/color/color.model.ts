import { Schema } from "mongoose";
import { TColor } from "./color.interface";

const colorSchema = new Schema<TColor>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  color: {
    type: String,
  },
});

export default colorSchema;
