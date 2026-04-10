import { dbManager } from "../../../config/db";
import ModelFactory from "../../../utils/modelFactory";
import { TProduct } from "./product.interface";

const createProductIntoDB = async (subdomain: string, payload: TProduct) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Product = ModelFactory.getModel(tenantConn, "Product");

  const result = await Product.create(payload);
  return result;
};

const getAllProductFromDB = async (subdomain: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Product = ModelFactory.getModel(tenantConn, "Product");

  const result = await Product.find();
  return result;
};

const getSingleProductFromDB = async (subdomain: string, id: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Product = ModelFactory.getModel(tenantConn, "Product");

  const result = await Product.findById(id);
  return result;
};

const updateProductInDB = async (
  subdomain: string,
  id: string,
  payload: TProduct,
) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Product = ModelFactory.getModel(tenantConn, "Product");

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteProductFromDB = async (subdomain: string, id: string) => {
  const tenantConn = await dbManager.getConnection(subdomain);
  const Product = ModelFactory.getModel(tenantConn, "Product");

  const result = await Product.findByIdAndDelete(id);
  return result;
};

export const productServices = {
  createProductIntoDB,
  getAllProductFromDB,
  getSingleProductFromDB,
  updateProductInDB,
  deleteProductFromDB,
};
