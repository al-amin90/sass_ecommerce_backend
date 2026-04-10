/* eslint-disable @typescript-eslint/no-unused-vars */

import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/SendResponse";
import { productServices } from "./product.service";

const createProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  console.log("subdomain", subdomain);

  const result = await productServices.createProductIntoDB(subdomain, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product is create Successfully",
    data: result,
  });
});

const getAllProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await productServices.getAllProductFromDB(subdomain);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All Product Retrieve data Successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await productServices.getSingleProductFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product Retrieve single data Successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await productServices.updateProductInDB(
    subdomain,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product Update data Successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.deleteProductFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product deleted Successfully",
    data: {},
  });
});

export const productControllers = {
  createProduct: createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
