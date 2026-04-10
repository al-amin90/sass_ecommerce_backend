import { Types } from "mongoose";

export type TStock = {
  size: number;
  quantity: number;
};

export type TVariant = {
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

  variant: TVariant[];

  images: string[];

  sku: string;

  isActive: boolean;
  isDeleted: boolean;
};
