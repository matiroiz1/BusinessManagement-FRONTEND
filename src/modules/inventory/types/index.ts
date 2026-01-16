export interface AdjustStockRequest {
  productId: string;
  quantity: number;
  direction: "IN" | "OUT";
  reason: string;
  notes?: string;
  performedByUserId?: string; // Lo sacaremos del AuthStore
}

export interface StockItemResponse {
  id: string;
  productId: string;
  onHand: number;
  criticalThreshold: number;
  minimumThreshold: number;
  stockState: "OK" | "LOW" | "CRITICAL";
  updatedAt: string;
}

export interface StockMovementResponse {
  id: string;
  createdAt: string;
  type: string; // SALE_OUT, ADJUSTMENT_IN, etc.
  quantity: number;
  reason: string;
  notes: string;
  referenceType: string;
}