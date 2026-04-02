import { model, Schema } from "mongoose";
import { TRegisterTenant } from "../auth/auth.interface";
import status from "http-status";
import AppError from "../../errors/AppError";

const tenantSchema = new Schema<TRegisterTenant>(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "failed", "canceled"],
      default: "pending",
    },
    approvedAt: String,
  },
  {
    timestamps: true,
  },
);

export default tenantSchema;
