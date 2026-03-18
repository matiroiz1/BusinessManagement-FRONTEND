"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, Loader2, ArrowRight, Tag, Star, Package, SearchX } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useCartStore } from "@/src/modules/shop/store/useCartStore"; // Importamos el store

interface Product {
  id: string;
  name: string;
  currentSalePrice: number;
  sku: string;
}

// --- HELPER PARA BÚSQUEDA INSENSIBLE ---
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function ShopHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/catalog/products`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar");
        return res.json();
      })
      .then(setProducts)
      .catch(() => toast.error("No se pudo conectar con el catálogo"))
      .finally(() => setLoading(false));
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const filteredProducts = useMemo(() => {
    if (!query) return products;
    const cleanQuery = normalizeText(query);
    return products.filter((product) => {
      const cleanName = normalizeText(product.name);
      const cleanSku = normalizeText(product.sku);
      return cleanName.includes(cleanQuery) || cleanSku.includes(cleanQuery);
    });
  }, [products, query]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* HERO (Oculto si buscas) */}
      {!query && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-blue-800 text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 px-8 py-16 md:py-24 md:px-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-4 border border-white/20">
                Nueva Colección 2026
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Tecnología que <span className="text-blue-300">Impulsa</span> tu Vida
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                Descubre nuestra selección premium de dispositivos con stock en tiempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="px-8 py-3.5 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Ver Catálogo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="hidden md:block relative w-80 h-80">
               <div className="absolute inset-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-3 transition-all duration-500">
                  <Package className="w-24 h-24 text-white opacity-80" />
               </div>
            </div>
          </div>
        </section>
      )}

      {/* RESULTADOS / PRODUCTOS */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {query ? `Resultados para "${query}"` : "Destacados"}
            </h2>
            <p className="text-sm text-gray-500">
              {query 
                ? `${filteredProducts.length} productos encontrados` 
                : "Los productos más buscados de la semana"}
            </p>
          </div>
          {!query && (
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="inline-flex bg-white p-4 rounded-full shadow-sm mb-4">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No encontramos productos</h3>
            <p className="text-gray-500">Intenta con otra palabra clave.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- COMPONENTE DE TARJETA CON CARRITO REAL ---
function ProductCard({ product }: { product: Product }) {
  // Usamos el store para agregar
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Llamada real al servicio
    addItem(product.id, 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-500">
          <Package className="w-12 h-12" />
        </div>
        
        <span className="absolute top-3 left-3 bg-black/5 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-gray-700 flex items-center gap-1">
           <Tag className="w-3 h-3" /> Nuevo
        </span>

        {/* Botón Agregar al Carrito (REAL) */}
        <button 
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
        >
            <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
           <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{product.sku}</p>
           <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
             {product.name}
           </h3>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
           {[1,2,3,4,5].map(i => (
             <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
           ))}
           <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through font-medium">$1299.00</span>
            <span className="text-xl font-extrabold text-gray-900">
              ${product.currentSalePrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}