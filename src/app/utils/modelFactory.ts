import { Connection, Model, Schema } from "mongoose";
import status from "http-status";
import AppError from "../errors/AppError";
import tenantSchema from "../modules/central/tenant.model";
import userSchema from "../modules/user/user.model";

export type CentralModelName =
  | "TenantRequest"
  | "Invoice"
  | "Coupon"
  | "CentralPayment"
  | "Subscription";

export type TenantModelName = "User";

export type ModelName = CentralModelName | TenantModelName;

const schemaRegistry: Record<ModelName, Schema> = {
  // Central
  TenantRequest: tenantSchema,

  // Tenant
  User: userSchema,
};

const centralModelNames: CentralModelName[] = [
  "TenantRequest",
  "Invoice",
  "Coupon",
  "CentralPayment",
  "Subscription",
];
const tenantModelNames: TenantModelName[] = ["User"];

class ModelFactory {
  static getModel<T = unknown>(
    connection: Connection,
    modelName: ModelName,
  ): Model<T> {
    if (connection.models[modelName]) {
      return connection.models[modelName] as Model<T>;
    }

    const schema = schemaRegistry[modelName];

    if (!schema) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Unknown model: "${modelName}"`,
      );
    }
    return connection.model<T>(modelName, schema);
  }
}

export default ModelFactory;
