import { apiFetchClient } from "@/src/shared/infrastructure/api-client";
import { AdjustStockRequest, StockItemResponse, StockMovementResponse } from "@/src/modules/inventory/types";

export interface InitializeStockRequest {
  productId: string;
  initialOnHand: number;
  criticalThreshold: number;
  minimumThreshold: number;
}
export interface DepositResponse {
  id: string;
  name: string;
  description: string;
}

export const inventoryService = {
  // Inicializar stock de un producto nuevo
  initializeStock: async (data: InitializeStockRequest) => {
    return await apiFetchClient("/inventory/stock/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Obtener stock de un producto (para ver si ya tiene)
  getStockByProduct: async (productId: string) => {
    // Nota: El backend devuelve 404 si no hay stock inicializado, 
    // así que manejamos el error devolviendo null para que el front no explote.
    try {
      return await apiFetchClient(`/inventory/stock/by-product/${productId}`);
    } catch (error) {
      return null;
    }
  },
  getDefaultDeposit: async (): Promise<DepositResponse> => {
    return await apiFetchClient("/inventory/deposits/default");
  },

  // Ajustar stock (Manual IN/OUT)
  adjustStock: async (data: AdjustStockRequest) => {
    return await apiFetchClient("/inventory/stock/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Consultar stock actual (Maneja el 404 devolviendo null)
  getStock: async (productId: string): Promise<StockItemResponse | null> => {
    return await apiFetchClient(`/inventory/stock/by-product/${productId}`);
  },

  // Consultar historial (Kardex)
  getMovements: async (productId: string): Promise<StockMovementResponse[]> => {
    return await apiFetchClient(`/inventory/movements/by-product/${productId}`);
  },

  // Obtener items con stock crítico
  getCriticalItems: async (): Promise<any[]> => {
    return await apiFetchClient("/inventory/stock/critical");
  },
};
