import { useInfiniteQuery } from "@tanstack/react-query";

import { BASE_URL, PAGE_SIZE } from "api/config";

import type { Product, ProductsResponse } from "./types";

export const productKeys = {
  list: ["products"] as const,
};

async function fetchProducts(skip: number, signal?: AbortSignal): Promise<ProductsResponse> {
  const response = await fetch(`${BASE_URL}/products?limit=${PAGE_SIZE}&skip=${skip}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function useProducts() {
  return useInfiniteQuery({
    queryKey: productKeys.list,
    queryFn: ({ pageParam, signal }) => fetchProducts(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.skip + lastPage.products.length;
      return next < lastPage.total ? next : undefined;
    },
    select: (data): Product[] => data.pages.flatMap((page) => page.products),
  });
}
