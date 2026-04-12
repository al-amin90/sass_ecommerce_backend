import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/SendResponse";
import { productServices } from "./product.service";
import uploadOnCloudinary from "../../../utils/cloudinary";

const createProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const files = req.files as Express.Multer.File[];
  const imageUrls: string[] = [];

  for (const file of files) {
    const url = await uploadOnCloudinary(file.path, "products");
    if (url) imageUrls.push(url);
  }

  const productData = {
    ...req.body,
    images: imageUrls,
  };

  const result = await productServices.createProductIntoDB(
    subdomain,
    productData,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.getAllProductsFromDB(
    subdomain,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.getSingleProductFromDB(
    subdomain,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.getProductBySlugFromDB(
    subdomain,
    req.params.slug,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product retrieved successfully",
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
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  await productServices.deleteProductFromDB(subdomain, req.params.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product deleted successfully",
    data: {},
  });
});

// ── Variant controllers ──

const addVariant = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.addVariantIntoDB(
    subdomain,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Variant added successfully",
    data: result,
  });
});

const updateVariant = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.updateVariantInDB(
    subdomain,
    req.params.id, // productId
    req.params.variantId,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant updated successfully",
    data: result,
  });
});

const deleteVariant = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  await productServices.deleteVariantFromDB(
    subdomain,
    req.params.id as string, // productId
    req.params.variantId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant deleted successfully",
    data: {},
  });
});

const checkStock = catchAsync(async (req, res, next) => {
  const subdomain = req.headers["x-tenant"] as string;

  const result = await productServices.checkStockFromDB(
    subdomain,
    req.body.items,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stock checked successfully",
    data: result,
  });
});

export const productControllers = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  checkStock,
};
