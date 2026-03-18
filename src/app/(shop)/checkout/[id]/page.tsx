"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, CreditCard, Lock, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cartService, SaleDetails } from "@/src/modules/shop/services/cart.service";
import Link from "next/link";
import confetti from "canvas-confetti"; // (Opcional) Si quieres fiesta, instala: npm install canvas-confetti @types/canvas-confetti

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id as string;

  const [sale, setSale] = useState<SaleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar datos de la venta al entrar
  useEffect(() => {
    cartService.getSale(saleId)
      .then(setSale)
      .catch(() => {
        toast.error("No se encontró la orden");
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [saleId, router]);

  // Manejar el pago
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simular delay de red bancaria (2 seg) para realismo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirmar venta en el backend
      await cartService.confirmPayment(saleId);

      // ¡ÉXITO!
      setSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); // Efecto visual
      toast.success("¡Pago aprobado! Tu pedido está confirmado.");

    } catch (error: any) {
      console.error(error);
      if (error.status === 409) {
        toast.error("¡Lo sentimos! El tiempo de reserva expiró y perdiste el stock.");
      } else {
        toast.error("Hubo un error al procesar el pago. Intenta de nuevo.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // --- VISTA DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Conectando con pasarela de pago segura...</p>
      </div>
    );
  }

  // --- VISTA DE ÉXITO (POST-PAGO) ---
  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Tu orden <strong>#{saleId.slice(0, 8)}</strong> ha sido confirmada.
          Te enviamos el comprobante a tu email.
        </p>
        <Link 
          href="/" 
          className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
        >
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (FORMULARIO) ---
  return (
    <div className="max-w-5xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* COLUMNA IZQUIERDA: FORMULARIO DE PAGO */}
      <div className="lg:col-span-7">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Método de Pago
          </h2>

          {/* Formulario Simulado (No funcional, solo visual) */}
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
              <input type="text" placeholder="Como figura en el plástico" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
              <div className="relative">
                <input type="text" placeholder="0000 0000 0000 0000" required maxLength={19} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                <input type="text" placeholder="MM/AA" required maxLength={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <div className="relative">
                  <input type="password" placeholder="123" required maxLength={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center" />
                  <Lock className="absolute right-3 top-2.5 w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando Pago...
                  </>
                ) : (
                  <>
                    Pagar ${sale?.total.toLocaleString("es-AR")}
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
              <Lock className="w-3 h-3" />
              Pagos procesados de forma segura con encriptación SSL de 256 bits.
            </div>
          </form>
        </div>
      </div>

      {/* COLUMNA DERECHA: RESUMEN DE COMPRA */}
      <div className="lg:col-span-5">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
          
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {sale?.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div className="flex gap-3">
                    <span className="font-bold text-gray-500">{item.quantity}x</span>
                    <span className="text-gray-700">{item.productName}</span>
                </div>
                <span className="font-medium text-gray-900">${item.lineTotal.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${sale?.total.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
            <span className="text-gray-900 font-bold text-lg">Total</span>
            <span className="text-2xl font-extrabold text-blue-600">${sale?.total.toLocaleString("es-AR")}</span>
          </div>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
             <p className="text-xs text-yellow-700 leading-relaxed">
               El stock de tus productos está reservado temporalmente. Completa el pago antes de que expire la sesión.
             </p>
          </div>
        </div>
      </div>

    </div>
  );
}