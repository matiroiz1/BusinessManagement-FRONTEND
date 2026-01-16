"use client";
import { useState, useEffect } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { Search, Save, Package, AlertTriangle, Loader2, Warehouse } from "lucide-react";
import { toast } from "sonner";

export const StockInitializer = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Estado para el nombre del depósito (inicia cargando...)
  const [depositName, setDepositName] = useState("Cargando depósito...");

  // Datos del formulario
  const [formData, setFormData] = useState({
    initialOnHand: 0,
    minimumThreshold: 5,   // Alerta amarilla
    criticalThreshold: 2,  // Alerta roja
  });

  useEffect(() => {
    // 1. Cargar Productos
    catalogService.getAllProducts().then(setProducts).catch(console.error);

    // 2. Cargar Nombre del Depósito Real (Nuevo)
    inventoryService.getDefaultDeposit()
      .then((d) => setDepositName(d.name))
      .catch((err) => {
        console.error(err);
        setDepositName("Depósito no detectado");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      await inventoryService.initializeStock({
        productId: selectedProduct,
        initialOnHand: Number(formData.initialOnHand),
        minimumThreshold: Number(formData.minimumThreshold),
        criticalThreshold: Number(formData.criticalThreshold),
      });
      
      toast.success("Stock inicializado correctamente");
      
      // Resetear form
      setFormData({ initialOnHand: 0, minimumThreshold: 5, criticalThreshold: 2 });
      setSelectedProduct("");
    } catch (error: any) {
      toast.error(error.message || "Error al inicializar el stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Package className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inicializar Inventario</h2>
          <p className="text-sm text-gray-500">Asigna el stock inicial a productos nuevos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Selección de Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
              required
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- CAMPO DE DEPÓSITO (Nuevo Visual) --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depósito de Destino</label>
          <div className="relative">
            <Warehouse className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={depositName} 
              disabled 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-100 text-gray-700 font-medium rounded-lg cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">
              * El sistema asignará automáticamente el depósito principal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock Físico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
            <input
              type="number"
              min="0"
              value={formData.initialOnHand}
              onChange={(e) => setFormData({ ...formData, initialOnHand: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
              required
            />
          </div>

          {/* Alerta Mínima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Stock Mínimo <span className="text-yellow-500 text-xs">(Alerta)</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.minimumThreshold}
              onChange={(e) => setFormData({ ...formData, minimumThreshold: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-800"
              required
            />
          </div>

          {/* Alerta Crítica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Punto Crítico <AlertTriangle className="w-3 h-3 text-red-500" />
            </label>
            <input
              type="number"
              min="0"
              value={formData.criticalThreshold}
              onChange={(e) => setFormData({ ...formData, criticalThreshold: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-800"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading || !selectedProduct}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            Guardar Inventario
          </button>
        </div>
      </form>
    </div>
  );
};