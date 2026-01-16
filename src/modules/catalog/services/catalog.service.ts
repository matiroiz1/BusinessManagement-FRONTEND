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

  // Obtener todos los productos
  getAllProducts: async (): Promise<any[]> => {
    return await apiFetchClient("/catalog/products");
  },
  // 1. Obtener un producto por ID (Para cargar el formulario de edición)
  getProductById: async (id: string) => {
    return await apiFetchClient(`/catalog/products/${id}`);
  },

  // 2. Actualizar producto (PUT)
  updateProduct: async (id: string, data: any) => {
    return await apiFetchClient(`/catalog/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // 3. Desactivar producto (DELETE)
  // Tu backend hace un Soft Delete (active = false), pero el verbo es DELETE
  deleteProduct: async (id: string) => {
    return await apiFetchClient(`/catalog/products/${id}`, {
      method: "DELETE",
    });
  },
  
  
};