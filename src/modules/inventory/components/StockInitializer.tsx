"use client";
import { useState, useEffect, useRef } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { Search, Save, Package, AlertTriangle, Loader2, Warehouse, X } from "lucide-react";
import { toast } from "sonner";

export const StockInitializer = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositName, setDepositName] = useState("Cargando depósito...");

  // -- BÚSQUEDA --
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    initialOnHand: 0,
    minimumThreshold: 5,
    criticalThreshold: 2,
  });

  useEffect(() => {
    catalogService.getAllProducts().then(setProducts).catch(console.error);
    inventoryService.getDefaultDeposit()
      .then((d) => setDepositName(d.name))
      .catch(() => setDepositName("Depósito no detectado"));
      
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      await inventoryService.initializeStock({
        productId: selectedProduct.id,
        initialOnHand: Number(formData.initialOnHand),
        minimumThreshold: Number(formData.minimumThreshold),
        criticalThreshold: Number(formData.criticalThreshold),
      });
      toast.success("Stock inicializado correctamente");
      
      setFormData({ initialOnHand: 0, minimumThreshold: 5, criticalThreshold: 2 });
      setSelectedProduct(null);
      setSearchQuery("");
    } catch (error: any) {
      toast.error(error.message || "Error al inicializar");
    } finally {
      setLoading(false);
    }
  };

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredProducts = products.filter(p => {
    const term = normalizeText(searchQuery);
    const name = normalizeText(p.name);
    const sku = normalizeText(p.sku);
    return name.includes(term) || sku.includes(term);
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Package className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cargar Stock Inicial</h2>
          <p className="text-sm text-gray-500">Asigna stock a productos nuevos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Selector Buscador */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
               type="text"
               placeholder="Escribe para buscar..."
               className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
               value={selectedProduct ? selectedProduct.name : searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setSelectedProduct(null);
                 setShowDropdown(true);
               }}
               onFocus={() => setShowDropdown(true)}
               required={!selectedProduct}
            />
            
            {(searchQuery || selectedProduct) && (
              <button
                type="button"
                onClick={() => {
                   setSearchQuery("");
                   setSelectedProduct(null);
                   setShowDropdown(true);
                }}
                className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showDropdown && (
             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setSearchQuery(p.name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-0 flex justify-between items-center group"
                    >
                       <div>
                          <p className="font-medium text-gray-800 group-hover:text-purple-700">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku}</p>
                       </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No encontrado</div>
                )}
             </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depósito</label>
          <div className="relative">
            <Warehouse className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input type="text" value={depositName} disabled className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-100 text-gray-700 font-medium rounded-lg cursor-not-allowed"/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
            <input type="number" min="0" value={formData.initialOnHand} onChange={(e) => setFormData({ ...formData, initialOnHand: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Stock Mínimo <span className="text-yellow-500 text-xs">(Alerta)</span></label>
            <input type="number" min="0" value={formData.minimumThreshold} onChange={(e) => setFormData({ ...formData, minimumThreshold: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-800" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Punto Crítico <AlertTriangle className="w-3 h-3 text-red-500" /></label>
            <input type="number" min="0" value={formData.criticalThreshold} onChange={(e) => setFormData({ ...formData, criticalThreshold: Number(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-800" required />
          </div>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" disabled={loading || !selectedProduct} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            Guardar Inventario
          </button>
        </div>
      </form>
    </div>
  );
};