import { getTenantModel } from "../../../utils/getTenantModel";
import { TColor } from "./color.interface";

const createColorIntoDB = async (subdomain: string, payload: TColor) => {
  const Color = await getTenantModel(subdomain, "Color");

  const result = await Color.create(payload);
  return result;
};

const getAllColorFromDB = async (subdomain: string) => {
  const Color = await getTenantModel(subdomain, "Color");

  const result = await Color.find();
  return result;
};

const getSingleColorFromDB = async (subdomain: string, id: string) => {
  const Color = await getTenantModel(subdomain, "Color");

  const result = await Color.findById(id);
  return result;
};

const updateColorInDB = async (
  subdomain: string,
  id: string,
  payload: TColor,
) => {
  const Color = await getTenantModel(subdomain, "Color");

  const result = await Color.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteColorFromDB = async (subdomain: string, id: string) => {
  const Color = await getTenantModel(subdomain, "Color");

  const result = await Color.findByIdAndDelete(id);
  return result;
};

export const colorServices = {
  createColorIntoDB,
  getAllColorFromDB,
  getSingleColorFromDB,
  updateColorInDB,
  deleteColorFromDB,
};
