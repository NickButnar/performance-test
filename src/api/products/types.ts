export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
};

/** Shape returned by GET /products?limit=&skip= */
export type ProductsResponse = {
  products: Product[];
  total: number;
  /** Offset of this page, in items. */
  skip: number;
  /** Items actually returned — NOT the requested limit. */
  limit: number;
};
