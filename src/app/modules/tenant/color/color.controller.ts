import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/SendResponse";
import { colorServices } from "./color.service";

const createColor = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await colorServices.createColorIntoDB(subdomain, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Color is create Successfully",
    data: result,
  });
});

const getAllColor = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await colorServices.getAllColorFromDB(subdomain);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All Color Retrieve data Successfully",
    data: result,
  });
});

const getSingleColor = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await colorServices.getSingleColorFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Color Retrieve single data Successfully",
    data: result,
  });
});

const updateColor = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;
  const result = await colorServices.updateColorInDB(
    subdomain,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Color Update data Successfully",
    data: result,
  });
});

const deleteColor = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await colorServices.deleteColorFromDB(
    subdomain,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Color deleted Successfully",
    data: {},
  });
});

export const colorControllers = {
  createColor,
  getAllColor,
  getSingleColor,
  updateColor,
  deleteColor,
};
