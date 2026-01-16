"use client";
import { useState, useEffect } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { salesService } from "@/src/modules/sales/services/sales.service";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { toast } from "sonner";
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, User, Loader2, Package, ChevronRight 
} from "lucide-react";

interface ProductWithStock {
  id: string;
  name: string;
  sku: string;
  currentSalePrice: number;
  initialStock: number;
}

interface CartItem {
  product: ProductWithStock;
  quantity: number;
}

export const PointOfSale = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [customer, setCustomer] = useState({ name: "", doc: "" });
  const [loadingSale, setLoadingSale] = useState(false);
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setLoadingData(true);
    try {
      const catalogData = await catalogService.getAllProducts();
      const productsWithStock = await Promise.all(
        catalogData.map(async (p: any) => {
          try {
            const stockInfo = await inventoryService.getStock(p.id);
            return {
              ...p,
              initialStock: stockInfo ? stockInfo.onHand : 0
            };
          } catch (e) {
            return { ...p, initialStock: 0 };
          }
        })
      );
      setProducts(productsWithStock);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar productos y stock");
    } finally {
      setLoadingData(false);
    }
  };

  const getAvailableStock = (product: ProductWithStock) => {
    const itemInCart = cart.find(item => item.product.id === product.id);
    const qtyInCart = itemInCart ? itemInCart.quantity : 0;
    return product.initialStock - qtyInCart;
  };

  const addToCart = (product: ProductWithStock) => {
    const available = getAvailableStock(product);
    if (available <= 0) {
      toast.error("Sin stock disponible");
      return;
    }
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
    toast.success("Agregado", { duration: 500, position: 'bottom-center' });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const currentQty = item.quantity;
          const product = item.product;
          if (delta > 0 && currentQty >= product.initialStock) {
            toast.error("Stock máximo alcanzado");
            return item;
          }
          const newQty = Math.max(1, currentQty + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoadingSale(true);
    try {
      const draftReq = {
        customerName: customer.name,
        customerDocument: customer.doc,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          discountAmount: 0 
        })),
      };
      const draft = await salesService.createDraft(draftReq);
      await salesService.confirmSale(draft.id);
      toast.success("Venta confirmada");
      setCart([]);
      setCustomer({ name: "", doc: "" });
      setMobileView('catalog'); 
      await loadMasterData(); 
    } catch (error: any) {
      toast.error(error.message || "Error al procesar venta");
    } finally {
      setLoadingSale(false);
    }
  };

  // --- LÓGICA DE BÚSQUEDA INSENSIBLE A ACENTOS ---
  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredProducts = products.filter(p => {
    const term = normalizeText(searchTerm);
    const name = normalizeText(p.name);
    const sku = normalizeText(p.sku);
    return name.includes(term) || sku.includes(term);
  });
  // -----------------------------------------------

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.currentSalePrice || 0) * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loadingData) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]">
      
      {/* Navegación Móvil */}
      <div className="lg:hidden flex mb-4 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
        <button
          onClick={() => setMobileView('catalog')}
          className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${
            mobileView === 'catalog' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
          }`}
        >
          <Package className="w-4 h-4" /> Catálogo
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${
            mobileView === 'cart' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> 
          Carrito ({cartItemCount})
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
        <div className={`
          flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full lg:w-2/3
          ${mobileView === 'catalog' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const available = getAvailableStock(product);
                const isOutOfStock = available <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`
                      flex flex-col text-left group relative
                      bg-white p-3 rounded-xl 
                      border shadow-sm 
                      transition-all duration-200 
                      ${isOutOfStock 
                        ? 'border-gray-200 opacity-60 cursor-not-allowed grayscale' 
                        : 'border-gray-300 hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 active:scale-95'
                      }
                    `}
                  >
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-10 border ${
                      available === 0 
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : available <= 5 
                          ? 'bg-red-50 text-red-600 border-red-100' 
                          : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {available === 0 ? "Sin Stock" : `${available} un.`}
                    </div>

                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 transition-colors">
                       <Package className={`w-8 h-8 ${!isOutOfStock && 'group-hover:text-blue-400'}`} />
                    </div>
                    
                    <div className="flex-1 flex flex-col w-full">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-1 group-hover:text-blue-600">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mb-2 truncate">SKU: {product.sku}</p>
                      
                      <div className="mt-auto w-full flex justify-between items-end border-t border-gray-100 pt-2">
                         <span className="font-bold text-gray-900 text-lg">${product.currentSalePrice?.toFixed(2)}</span>
                         {!isOutOfStock && (
                           <div className="bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-3 h-3" />
                           </div>
                         )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
          
          <div className="lg:hidden p-4 border-t border-gray-200 bg-white">
             <button onClick={() => setMobileView('cart')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-between px-6 shadow-md active:bg-blue-700">
                <span>Ver Carrito ({cartItemCount})</span>
                <span>${cartTotal.toFixed(2)}</span>
             </button>
          </div>
        </div>

        {/* SECCIÓN DERECHA: TICKET */}
        <div className={`
          flex-col bg-white rounded-xl shadow-sm border border-gray-200 h-full w-full lg:w-1/3
          ${mobileView === 'cart' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="p-4 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <ShoppingCart className="w-5 h-5 text-blue-700" />
               <h3 className="font-bold text-blue-900">Venta Actual</h3>
             </div>
             <button onClick={() => setMobileView('catalog')} className="lg:hidden text-blue-700 text-sm font-medium flex items-center">
                Seguir comprando <ChevronRight className="w-4 h-4"/>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1 min-w-0 pr-2">
                     <p className="text-sm font-bold text-gray-800 truncate">{item.product.name}</p>
                     <p className="text-xs text-blue-600 font-semibold">${item.product.currentSalePrice?.toFixed(2)} u.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white rounded-md border border-gray-300">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:bg-gray-100 text-gray-600 border-r border-gray-200"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:bg-gray-100 text-gray-600 border-l border-gray-200"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase"><User className="w-3 h-3" /> Cliente (Opcional)</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nombre" className="w-full p-2 text-sm border rounded-lg text-gray-800 focus:ring-1 focus:ring-blue-500" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <input type="text" placeholder="DNI / CUIT" className="w-full p-2 text-sm border rounded-lg text-gray-800 focus:ring-1 focus:ring-blue-500" value={customer.doc} onChange={e => setCustomer({...customer, doc: e.target.value})} />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3">
               <div className="flex justify-between items-center mb-4"><span className="text-gray-600 font-medium">Total a Pagar</span><span className="text-3xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span></div>
               <button onClick={handleCheckout} disabled={cart.length === 0 || loadingSale} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                 {loadingSale ? <Loader2 className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                 Confirmar Venta
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};