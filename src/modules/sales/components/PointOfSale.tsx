"use client";
import { useState, useEffect } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { salesService } from "@/src/modules/sales/services/sales.service";
import { toast } from "sonner";
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, User, FileText, Loader2 
} from "lucide-react";

// Tipo local para el carrito (UI)
interface CartItem {
  product: any; // Producto del catálogo completo
  quantity: number;
}

export const PointOfSale = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Datos del cliente opcional
  const [customer, setCustomer] = useState({ name: "", doc: "" });
  const [loadingSale, setLoadingSale] = useState(false);

  useEffect(() => {
    catalogService.getAllProducts().then(setProducts).catch(console.error);
  }, []);

  // Agregar al carrito
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Modificar cantidad
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // Eliminar del carrito
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cálculos visuales (Estimados para la UI)
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.currentSalePrice || 0) * item.quantity,
    0
  );

  // Proceso de Venta (Draft -> Confirm)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoadingSale(true);

    try {
      // 1. Crear el DRAFT
      const draftReq = {
        customerName: customer.name,
        customerDocument: customer.doc,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          discountAmount: 0 // Futura implementación de descuentos
        })),
      };

      const draft = await salesService.createDraft(draftReq);

      // 2. Confirmar inmediatamente (Simulando flujo POS rápido)
      await salesService.confirmSale(draft.id);

      toast.success("Venta realizada con éxito", {
        description: `Total cobrado: $${cartTotal.toFixed(2)}`
      });

      // Limpiar todo
      setCart([]);
      setCustomer({ name: "", doc: "" });

    } catch (error: any) {
      toast.error("Error al procesar la venta", {
        description: error.message
      });
    } finally {
      setLoadingSale(false);
    }
  };

  // Filtro de productos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
      <div className="lg:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Buscador */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grilla de Productos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col items-start p-4 border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 transition-all bg-white text-left group"
              >
                <div className="w-full aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300">
                   {/* Aquí iría la imagen del producto en el futuro */}
                   <ShoppingBagIcon />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-600">
                  {product.name}
                </h4>
                <div className="mt-auto w-full flex justify-between items-end">
                   <span className="text-xs text-gray-500">{product.sku}</span>
                   <span className="font-bold text-gray-900">${product.currentSalePrice?.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: TICKET / CARRITO */}
      <div className="lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200 bg-blue-50 flex items-center gap-2">
           <ShoppingCart className="w-5 h-5 text-blue-700" />
           <h3 className="font-bold text-blue-900">Venta Actual</h3>
        </div>

        {/* Lista de Ítems */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <ShoppingCart className="w-12 h-12 mb-2" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0 pr-2">
                   <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                   <p className="text-xs text-blue-600 font-semibold">
                      ${item.product.currentSalePrice?.toFixed(2)} u.
                   </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-md border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 hover:bg-gray-100 text-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 hover:bg-gray-100 text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Ticket */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
          
          {/* Datos Cliente (Opcional) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase">
              <User className="w-3 h-3" /> Cliente (Opcional)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Nombre" 
                className="w-full p-2 text-sm border rounded-lg text-gray-800"
                value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="DNI / CUIT" 
                className="w-full p-2 text-sm border rounded-lg text-gray-800"
                value={customer.doc}
                onChange={e => setCustomer({...customer, doc: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
             <div className="flex justify-between items-center mb-4">
               <span className="text-gray-600 font-medium">Total a Pagar</span>
               <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
             </div>
             
             <button
               onClick={handleCheckout}
               disabled={cart.length === 0 || loadingSale}
               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
               {loadingSale ? <Loader2 className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
               Confirmar Venta
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icono simple auxiliar
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 opacity-20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);