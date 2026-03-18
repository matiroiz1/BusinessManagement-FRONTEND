import { apiFetchClient } from "@/src/shared/infrastructure/api-client";

// --- INTERFACES (Tipos de datos) ---

// 1. Un item dentro del carrito
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

// 2. La respuesta del Carrito completo
export interface CartResponse {
  id: string;
  items: CartItem[];
}

// 3. ¡AQUÍ ESTÁ LA QUE FALTABA! 
// Detalle de la Venta para el Checkout
export interface SaleDetails {
  id: string;
  total: number;
  status: string;
  items: SaleItemDetail[];
}

// 4. Detalle de los items dentro de la venta
export interface SaleItemDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}


// --- SERVICIO (Lógica) ---

export const cartService = {
  // Obtener carrito actual
  getMyCart: async (): Promise<CartResponse> => {
    return await apiFetchClient("/cart");
  },

  // Agregar item al carrito
  addItem: async (productId: string, quantity: number): Promise<CartResponse> => {
    return await apiFetchClient("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Quitar item del carrito
  removeItem: async (productId: string): Promise<CartResponse> => {
    return await apiFetchClient(`/cart/items/${productId}`, {
      method: "DELETE",
    });
  },

  // Checkout (Reservar Stock y crear Venta PENDING)
  checkout: async (guestData?: { guestName: string; guestEmail: string }) => {
    // Si viene guestData, lo enviamos en el body. Si no, enviamos null o objeto vacío.
    return await apiFetchClient("/cart/checkout", {
      method: "POST",
      body: JSON.stringify(guestData || {}),
    });
  },

  // Obtener una venta por ID (Para la pantalla de pago)
  getSale: async (id: string): Promise<SaleDetails> => {
    return await apiFetchClient(`/sales/${id}`);
  },

  // Confirmar el pago de esa venta
  confirmPayment: async (id: string): Promise<void> => {
    return await apiFetchClient(`/sales/${id}/confirm`, {
      method: "POST",
    });
  }

};