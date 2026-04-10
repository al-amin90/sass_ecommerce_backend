import { dbManager } from "../config/db";
import ModelFactory, { ModelName } from "./modelFactory";

export const getTenantModel = async (
  subdomain: string,
  modelName: ModelName,
) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  return ModelFactory.getModel(tenantConn, modelName);
};
