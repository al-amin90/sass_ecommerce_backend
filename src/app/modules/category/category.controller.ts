/* eslint-disable @typescript-eslint/no-unused-vars */

import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/SendResponse";
import { categoryServices } from "./category.service";

const createCategory = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  console.log("subdomain", subdomain);

  const result = await categoryServices.createCategoryIntoDB(
    subdomain,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category is create Successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await categoryServices.getAllCategoryFromDB(subdomain);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All Category Retrieve data Successfully",
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await categoryServices.getSingleCategoryFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category Retrieve single data Successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await categoryServices.updateCategoryInDB(
    subdomain,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category Update data Successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await categoryServices.deleteCategoryFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category deleted Successfully",
    data: {},
  });
});

export const categoryControllers = {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
