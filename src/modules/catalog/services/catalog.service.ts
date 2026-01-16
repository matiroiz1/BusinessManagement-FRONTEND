import { apiFetchClient } from "@/src/shared/infrastructure/api-client";
import { CreateProductRequest, ProductType, ProductStatus, UnitMeasure } from "../types";

export const catalogService = {
  // --- Maestros para los Selects ---
  getProductTypes: async (): Promise<ProductType[]> => {
    return await apiFetchClient("/catalog/product-types");
  },

  getProductStatuses: async (): Promise<ProductStatus[]> => {
    return await apiFetchClient("/catalog/product-statuses");
  },

  getUnitMeasures: async (): Promise<UnitMeasure[]> => {
    return await apiFetchClient("/catalog/unit-measures");
  },

  // --- Operaciones de Producto ---
  createProduct: async (product: CreateProductRequest) => {
    return await apiFetchClient("/catalog/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },
};