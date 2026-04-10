import { dbManager } from "../../../config/db";
import ModelFactory from "../../../utils/modelFactory";
import { TCategory } from "./category.interface";

const createCategoryIntoDB = async (subdomain: string, payload: TCategory) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Category = ModelFactory.getModel(tenantConn, "Category");

  const result = await Category.create(payload);
  return result;
};

const getAllCategoryFromDB = async (subdomain: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Category = ModelFactory.getModel(tenantConn, "Category");

  const result = await Category.find();
  return result;
};

const getSingleCategoryFromDB = async (subdomain: string, id: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Category = ModelFactory.getModel(tenantConn, "Category");

  const result = await Category.findById(id);
  return result;
};

const updateCategoryInDB = async (
  subdomain: string,
  id: string,
  payload: TCategory,
) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Category = ModelFactory.getModel(tenantConn, "Category");

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCategoryFromDB = async (subdomain: string, id: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Category = ModelFactory.getModel(tenantConn, "Category");

  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const categoryServices = {
  createCategoryIntoDB,
  getAllCategoryFromDB,
  getSingleCategoryFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
