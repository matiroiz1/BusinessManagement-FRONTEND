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

  // 1. Obtener venta por ID (Para mostrar el total en la pantalla de pago)
  getSaleById: async (id: string) => {
    return await apiFetchClient(`/sales/${id}`);
  },

  // 2. Confirmar pago (Pasa de PENDING a CONFIRMED)
  confirmSale: async (id: string) => {
    return await apiFetchClient(`/sales/${id}/confirm`, {
      method: "POST",
    });
  },
};