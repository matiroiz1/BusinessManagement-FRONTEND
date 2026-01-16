import { apiFetchClient } from "@/src/shared/infrastructure/api-client";
import { CreateSaleRequest, SaleResponse } from "@/src/modules/sales/types";

export const salesService = {
  // Listar todas las ventas
  getAll: async (): Promise<SaleResponse[]> => {
    return await apiFetchClient("/sales");
  },

  // Obtener una venta por ID
  getById: async (id: string): Promise<SaleResponse> => {
    return await apiFetchClient(`/sales/${id}`);
  },

  // Paso 1: Crear Borrador
  createDraft: async (data: CreateSaleRequest): Promise<SaleResponse> => {
    return await apiFetchClient("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Paso 2: Confirmar Venta (Congela precios y baja stock)
  confirmSale: async (id: string): Promise<SaleResponse> => {
    return await apiFetchClient(`/sales/${id}/confirm`, {
      method: "POST",
    });
  },
};