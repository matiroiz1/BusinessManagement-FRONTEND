import { create } from 'zustand';
import { toast } from 'sonner';
import { cartService, CartItem } from '../services/cart.service';

interface CartState {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  
  // Acciones
  loadCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void; // Útil para limpiar al salir
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  isLoading: false,

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.getMyCart();
      // Calcular total de items sumando cantidades
      const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      set({ items: cart.items, itemCount: count });
    } catch (error) {
      console.error("Error cargando carrito", error);
      // No mostramos toast de error aquí para no molestar si solo está vacío
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    // 1. Feedback visual inmediato (carga)
    // Podrías implementar optimismo aquí, pero por seguridad esperemos al back
    
    try {
      const cart = await cartService.addItem(productId, quantity);
      
      const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      set({ items: cart.items, itemCount: count });
      
      toast.success("Producto agregado al carrito");
    } catch (error) {
      toast.error("Error al agregar. Verifica tu sesión.");
      console.error(error);
    }
  },

  removeItem: async (productId: string) => {
    try {
      const cart = await cartService.removeItem(productId);
      const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      set({ items: cart.items, itemCount: count });
      toast.success("Producto eliminado");
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  },
  
  clearCart: () => {
      set({ items: [], itemCount: 0 });
  }
}));