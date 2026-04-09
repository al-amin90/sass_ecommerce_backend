import { Types } from "mongoose";

export type TRegisterTenant = {
  businessName: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  contactPhone?: string;
  isActive: boolean;
  address?: string;
  status: string;
  approvedAt: string;
};

export type LoginBody = {
  email: string;
  password: string;
  subdomain: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export interface ITenantRequest extends Document {
  _id: Types.ObjectId;
  businessName: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}
