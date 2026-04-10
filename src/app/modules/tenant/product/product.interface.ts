export type TVariant = {
  size: number;
  color: string;
  stock: number;
};

export type TProduct = {
  name: string;
  slug: string;

  description?: string;

  price: number;
  discountPrice?: number;

  variants: TVariant[];

  images: string[];

  sku: string;

  isActive: boolean;
  isDeleted: boolean;
};
