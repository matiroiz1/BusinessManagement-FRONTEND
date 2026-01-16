export interface SaleItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
}

export interface SaleResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  soldByUserId: string;
  customerName?: string;
  customerDocument?: string;
  subtotal: number;
  totalDiscount: number;
  total: number;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  items: SaleItemResponse[];
}

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
  discountAmount?: number;
}

export interface CreateSaleRequest {
  customerName?: string;
  customerDocument?: string;
  notes?: string;
  items: CreateSaleItemRequest[];
}