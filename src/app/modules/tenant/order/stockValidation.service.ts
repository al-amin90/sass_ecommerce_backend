import status from "http-status";
import AppError from "../../../errors/AppError";
import { getTenantModel } from "../../../utils/getTenantModel";
import { TProduct, TVariant } from "../product/product.interface";
import { Types } from "mongoose";
import { TColor } from "../color/color.interface";

interface StockCheckItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string; // এখন এটা color NAME থাকবে (hex code যেমন "#ff0000")
}

interface StockCheckResult {
  isAvailable: boolean;
  message?: string;
  unavailableItems?: {
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
  }[];
}

// ✅ Color ID খুঁজি color code দিয়ে
const getColorIdByCode = async (
  subdomain: string,
  colorCode: string,
): Promise<Types.ObjectId> => {
  try {
    const Color = await getTenantModel<TColor>(subdomain, "Color");

    console.log(`🔍 Finding color by code: ${colorCode}`);

    const color = await Color.findOne({
      color: colorCode, // "#ff0000" দিয়ে খুঁজি
    });
    console.log("colorCode", colorCode);

    if (!color) {
      throw new AppError(status.NOT_FOUND, `Color not found: ${colorCode}`);
    }

    console.log(`✅ Color found: ${color.name} (${color.color})`);

    return color._id;
  } catch (error) {
    console.error("❌ Error finding color:", error);
    throw error;
  }
};

// ✅ Stock availability check করি
const checkStockAvailability = async (
  subdomain: string,
  items: StockCheckItem[],
): Promise<StockCheckResult> => {
  try {
    console.log("✅ Checking stock availability...");

    const Product = await getTenantModel<TProduct>(subdomain, "Product");
    const Color = await getTenantModel(subdomain, "Color");

    const unavailableItems = [];

    for (const item of items) {
      console.log(`📦 Checking Product: ${item.productId}`);
      console.log(`   Color Code: ${item.selectedColor}`);
      console.log(`   Size: ${item.selectedSize}`);
      console.log(`   Quantity: ${item.quantity}`);

      // Validate ObjectId format for productId
      if (!Types.ObjectId.isValid(item.productId)) {
        throw new AppError(
          status.BAD_REQUEST,
          `Invalid product ID: ${item.productId}`,
        );
      }

      // Product খুঁজি
      const product = await Product.findOne({
        _id: new Types.ObjectId(item.productId),
        isDeleted: false,
        isActive: true,
      });

      if (!product) {
        throw new AppError(
          status.NOT_FOUND,
          `Product not found: ${item.productId}`,
        );
      }

      console.log(`✅ Product found: ${product.name}`);

      // ✅ Color খুঁজি color CODE দিয়ে (hex code যেমন "#ff0000")
      const colorIdByCode = await getColorIdByCode(
        subdomain,
        item.selectedColor,
      );

      console.log(`✅ Color ID resolved: ${colorIdByCode}`);

      // Variant এ এই color আছে কিনা খুঁজি
      const variantIndex = product.variant.findIndex(
        (v: TVariant) =>
          v.color && v.color.toString() === colorIdByCode.toString(),
      );

      if (variantIndex === -1) {
        throw new AppError(
          status.BAD_REQUEST,
          `Color (${item.selectedColor}) not available for product: ${product.name}`,
        );
      }

      console.log(`✅ Color found in product variants`);

      // Size এর stock খুঁজি
      const variant = product.variant[variantIndex];
      const sizeNum = parseInt(item.selectedSize);

      if (isNaN(sizeNum)) {
        throw new AppError(
          status.BAD_REQUEST,
          `Invalid size format: ${item.selectedSize}`,
        );
      }

      const sizeStock = variant.stock.find((s) => s.size === sizeNum);

      if (!sizeStock) {
        throw new AppError(
          status.BAD_REQUEST,
          `Size ${item.selectedSize} not available for ${product.name}. Available sizes: ${variant.stock.map((s) => s.size).join(", ")}`,
        );
      }

      console.log(
        `📊 Current stock for size ${item.selectedSize}: ${sizeStock.quantity}`,
      );

      // Quantity check করি
      if (sizeStock.quantity < item.quantity) {
        console.warn(
          `❌ Insufficient stock: ${product.name} - Size: ${item.selectedSize} - Requested: ${item.quantity}, Available: ${sizeStock.quantity}`,
        );

        unavailableItems.push({
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: sizeStock.quantity,
        });
      } else {
        console.log(
          `✅ Stock available: ${product.name} - Size: ${item.selectedSize}`,
        );
      }
    }

    if (unavailableItems.length > 0) {
      return {
        isAvailable: false,
        message: "Insufficient stock for some items",
        unavailableItems,
      };
    }

    console.log("✅ All items have sufficient stock!");
    return {
      isAvailable: true,
      message: "All items are available",
    };
  } catch (error) {
    console.error("❌ Stock check error:", error);
    throw error;
  }
};

// ✅ Stock reduce করি
const reduceStock = async (
  subdomain: string,
  items: StockCheckItem[],
): Promise<void> => {
  try {
    console.log("📉 Reducing stock...");

    const Product = await getTenantModel<TProduct>(subdomain, "Product");

    for (const item of items) {
      const product = await Product.findOne({
        _id: new Types.ObjectId(item.productId),
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // ✅ Color ID খুঁজি color code দিয়ে
      const colorIdByCode = await getColorIdByCode(
        subdomain,
        item.selectedColor,
      );

      // Variant খুঁজি
      const variantIndex = product.variant.findIndex(
        (v: TVariant) =>
          v.color && v.color.toString() === colorIdByCode.toString(),
      );

      if (variantIndex === -1) {
        throw new Error(`Color not found for product: ${item.productId}`);
      }

      // Stock update করি
      const variant = product.variant[variantIndex];
      const sizeNum = parseInt(item.selectedSize);
      const sizeStockIndex = variant.stock.findIndex((s) => s.size === sizeNum);

      if (sizeStockIndex === -1) {
        throw new Error(`Size not found for product: ${item.productId}`);
      }

      // Stock reduce করি
      const previousQuantity = variant.stock[sizeStockIndex].quantity;
      variant.stock[sizeStockIndex].quantity -= item.quantity;

      console.log(
        `Reduced stock: ${product.name} - Size: ${item.selectedSize} - Previous: ${previousQuantity}, New: ${variant.stock[sizeStockIndex].quantity}`,
      );

      // DB তে save করি
      await Product.findByIdAndUpdate(
        product._id,
        { variant: product.variant },
        { new: true },
      );
    }

    console.log("✅ Stock reduced successfully");
  } catch (error) {
    console.error("❌ Stock reduction error:", error);
    throw error;
  }
};

// ✅ Stock restore করি
const restoreStock = async (
  subdomain: string,
  items: StockCheckItem[],
): Promise<void> => {
  try {
    console.log("📈 Restoring stock...");

    const Product = await getTenantModel<TProduct>(subdomain, "Product");

    for (const item of items) {
      const product = await Product.findOne({
        _id: new Types.ObjectId(item.productId),
      });

      if (!product) {
        console.warn(`Product not found: ${item.productId}`);
        continue;
      }

      // ✅ Color ID খুঁজি color code দিয়ে
      const colorIdByCode = await getColorIdByCode(
        subdomain,
        item.selectedColor,
      ).catch(() => null);

      if (!colorIdByCode) {
        console.warn(`Color not found: ${item.selectedColor}`);
        continue;
      }

      const variantIndex = product.variant.findIndex(
        (v: TVariant) =>
          v.color && v.color.toString() === colorIdByCode.toString(),
      );

      if (variantIndex === -1) {
        console.warn(`Variant not found for color: ${item.selectedColor}`);
        continue;
      }

      const variant = product.variant[variantIndex];
      const sizeNum = parseInt(item.selectedSize);
      const sizeStockIndex = variant.stock.findIndex((s) => s.size === sizeNum);

      if (sizeStockIndex === -1) {
        console.warn(`Size not found: ${item.selectedSize}`);
        continue;
      }

      // Stock restore করি
      const previousQuantity = variant.stock[sizeStockIndex].quantity;
      variant.stock[sizeStockIndex].quantity += item.quantity;

      console.log(
        `Restored stock: ${product.name} - Size: ${item.selectedSize} - Previous: ${previousQuantity}, New: ${variant.stock[sizeStockIndex].quantity}`,
      );

      // DB তে save করি
      await Product.findByIdAndUpdate(
        product._id,
        { variant: product.variant },
        { new: true },
      );
    }

    console.log("✅ Stock restored successfully");
  } catch (error) {
    console.error("❌ Stock restore error:", error);
    throw error;
  }
};

export default {
  checkStockAvailability,
  reduceStock,
  restoreStock,
};
