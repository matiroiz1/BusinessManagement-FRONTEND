import Link from "next/link";
import { ShoppingCart, User, Package, Search, Menu } from "lucide-react";
import { SearchInput } from "./components/SearchInput";
import { ShopHeader } from "./components/ShopHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* --- HEADER FLOTANTE PREMIUM --- */}
      <ShopHeader />

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* Agregamos pt-20 para compensar el header fixed */}
      <main className="flex-1 w-full pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* --- FOOTER MODERNO --- */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <span className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                 <Package className="w-5 h-5 text-blue-600" /> GestCom
              </span>
              <p className="text-gray-500 text-sm leading-relaxed">
                La mejor plataforma para gestionar tu negocio y vender online con stock en tiempo real.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Tienda</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Novedades</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Ofertas</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Categorías</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Envíos</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Devoluciones</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
            © 2026 GestCom Inc. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}