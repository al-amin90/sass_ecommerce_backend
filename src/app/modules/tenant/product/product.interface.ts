import { Types } from "mongoose";

export type TStock = {
  size: number;
  quantity: number;
};

export type TVariant = {
  productID: Types.ObjectId;
  color: string;
  stock: TStock[];
};

export type TProduct = {
  name: string;
  slug: string;

  description?: string;

  price: number;
  discountPrice?: number;
  categoryID: Types.ObjectId;

  variantID: Types.ObjectId;

  images: string[];

  sku: string;

  isActive: boolean;
  isDeleted: boolean;
};
