"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ShoppingBag, Package, Loader2, CreditCard, X, User, Mail } from "lucide-react";
import { useCartStore } from "@/src/modules/shop/store/useCartStore";
import { toast } from "sonner";
import { cartService } from "@/src/modules/shop/services/cart.service";
import { useAuthStore } from "@/src/modules/auth/store/authStore"; 

// 1. Helper para leer cookies (Soluciona la desincronización del estado)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function CartPage() {
  const router = useRouter();
  const { items, isLoading, loadCart, removeItem, clearCart } = useCartStore();
  
  // 2. Estado local para saber si es Auth real (Cookie o Store)
  const [isAuth, setIsAuth] = useState(false);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestData, setGuestData] = useState({ name: "", email: "" });

  useEffect(() => {
    loadCart();
    
    // 3. Verificación robusta de autenticación al cargar
    // Si existe el token en el store O la cookie 'auth_token', es un usuario real.
    const token = useAuthStore.getState().token || getCookie("auth_token");
    setIsAuth(!!token);
  }, []);

  const total = items.reduce((acc, item) => acc + item.total, 0);

  // MANEJADOR DEL CLIC EN "CONFIRMAR COMPRA"
  const handleCheckoutClick = () => {
    if (isAuth) {
      // ✅ USUARIO REGISTRADO: Pasamos directo.
      // El backend usará los datos de la base de datos.
      processCheckout();
    } else {
      // 👤 INVITADO: Abrimos modal.
      setShowGuestModal(true);
    }
  };

  // LÓGICA DE CHECKOUT
  const processCheckout = async (guestDetails?: { guestName: string; guestEmail: string }) => {
    setIsCheckingOut(true);
    try {
      const sale = await cartService.checkout(guestDetails);
      
      clearCart();
      toast.success("¡Stock reservado con éxito!");
      
      router.push(`/checkout/${sale.id}`);
      
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar el checkout.");
    } finally {
      setIsCheckingOut(false);
      setShowGuestModal(false);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Cargando tu carrito...</p>
      </div>
    );
  }

  // --- ESTADO VACÍO ---
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Parece que aún no has agregado nada. Explora nuestro catálogo.
        </p>
        <Link href="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
          Ir a la Tienda <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // --- CARRITO CON ITEMS ---
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-blue-600" />
        Tu Carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LISTA DE ITEMS */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex gap-6 items-center shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.productName}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  Unitario: ${item.price.toLocaleString("es-AR")}
                </div>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                  Cant: {item.quantity}
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="font-bold text-xl text-gray-900">
                  ${item.total.toLocaleString("es-AR")}
                </span>
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RESUMEN DE ORDEN */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-3xl font-extrabold text-blue-600">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={isCheckingOut}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Compra <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA INVITADOS --- */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Finalizar como Invitado</h3>
              <button onClick={() => setShowGuestModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Ingresa tus datos de contacto para enviarte el comprobante y el seguimiento de tu compra.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Ej: Juan Pérez"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={guestData.name}
                      onChange={e => setGuestData({...guestData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="Ej: juan@gmail.com"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={guestData.email}
                      onChange={e => setGuestData({...guestData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowGuestModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => processCheckout({ guestName: guestData.name, guestEmail: guestData.email })}
                disabled={!guestData.name || !guestData.email || isCheckingOut}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continuar al Pago"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}