"use client";
import { useState, useEffect } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { StockItemResponse, StockMovementResponse } from "../types";
import { toast } from "sonner";
import { 
  Search, RefreshCw, ArrowUpCircle, ArrowDownCircle, 
  History, AlertCircle, CheckCircle, Package, FileText, AlertTriangle 
} from "lucide-react";

export const ProductInventoryManager = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  
  // Estados de datos
  const [stockItem, setStockItem] = useState<StockItemResponse | null>(null);
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Estado del formulario de ajuste
  const [adjustForm, setAdjustForm] = useState({
    quantity: 0,
    direction: "IN",
    reason: "Corrección de Inventario",
    notes: ""
  });
  const [loadingAdjust, setLoadingAdjust] = useState(false);

  useEffect(() => {
    catalogService.getAllProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductData(selectedProduct);
    } else {
      setStockItem(null);
      setMovements([]);
    }
  }, [selectedProduct]);

  const loadProductData = async (productId: string) => {
    setLoadingData(true);
    try {
      // Usamos el servicio modificado que devuelve null en vez de error 404
      const stockData = await inventoryService.getStock(productId);
      
      if (stockData) {
        // Solo cargamos movimientos si existe el stock
        const movementsData = await inventoryService.getMovements(productId);
        setStockItem(stockData);
        setMovements(movementsData);
      } else {
        // Si es null, limpiamos todo
        setStockItem(null);
        setMovements([]);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setStockItem(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;

    setLoadingAdjust(true);
    try {
      await inventoryService.adjustStock({
        productId: selectedProduct,
        quantity: Number(adjustForm.quantity),
        direction: adjustForm.direction as "IN" | "OUT",
        reason: adjustForm.reason,
        notes: adjustForm.notes,
        performedByUserId: user.userId
      });
      await loadProductData(selectedProduct);
      setAdjustForm({ ...adjustForm, quantity: 0, notes: "" });
      
      toast.success("Ajuste realizado con éxito");

    } catch (error: any) {
      toast.error(error.message || "Error al realizar el ajuste");
    } finally {
      setLoadingAdjust(false);
    }
  };

  const getStateColor = (state?: string) => {
    if (state === "CRITICAL") return "text-red-600 bg-red-50 border-red-200";
    if (state === "LOW") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Selector de Producto */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Producto a Gestionar</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          >
            <option value="">-- Selecciona un producto --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- CARGANDO --- */}
      {loadingData && (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
           <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600 mb-2"></div>
           <p>Cargando información de inventario...</p>
        </div>
      )}

      {/* --- CASO: NO INICIALIZADO --- */}
      {!loadingData && selectedProduct && !stockItem && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Stock No Inicializado</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Este producto existe en el catálogo pero aún no tiene un registro de inventario en el depósito.
            Debes establecer su stock inicial y alertas antes de poder realizar ajustes.
          </p>
          <div className="inline-flex bg-white px-4 py-2 rounded-lg border border-yellow-200 text-sm font-medium text-yellow-800 shadow-sm">
             Ve a la pestaña "Inicializar Productos Nuevos" arriba para configurarlo.
          </div>
        </div>
      )}

      {/* --- CASO: TODO OK (Interfaz Normal) --- */}
      {!loadingData && selectedProduct && stockItem && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* 2. Tarjeta de Estado Actual */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Stock Actual
            </h3>
            
            <div className="text-center py-6">
              <span className={`text-5xl font-bold block mb-2 ${stockItem.stockState === 'CRITICAL' ? 'text-red-600' : 'text-gray-900'}`}>
                {stockItem.onHand}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStateColor(stockItem.stockState)}`}>
                  {stockItem.stockState === 'OK' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                  Estado: {stockItem.stockState}
              </span>
              <p className="text-xs text-gray-400 mt-4">Última actualización: {new Date(stockItem.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* 3. Formulario de Ajuste */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Realizar Ajuste Manual
            </h3>
            
            <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  required
                  value={adjustForm.quantity}
                  onChange={e => setAdjustForm({...adjustForm, quantity: Number(e.target.value)})}
                  className="w-full mt-1 p-2 border rounded-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Tipo de Movimiento</label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({...adjustForm, direction: "IN"})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${adjustForm.direction === 'IN' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <ArrowUpCircle className="w-4 h-4"/> Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({...adjustForm, direction: "OUT"})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${adjustForm.direction === 'OUT' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <ArrowDownCircle className="w-4 h-4"/> Salida
                  </button>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-medium text-gray-500 uppercase">Motivo</label>
                 <select 
                    value={adjustForm.reason}
                    onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-lg bg-white text-gray-800"
                 >
                    <option>Corrección de Inventario</option>
                    <option>Deterioro / Rotura</option>
                    <option>Pérdida / Robo</option>
                    <option>Regalo / Bonificación</option>
                 </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Notas (Opcional)</label>
                <input 
                  type="text"
                  value={adjustForm.notes}
                  onChange={e => setAdjustForm({...adjustForm, notes: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-lg text-gray-800"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button 
                  type="submit" 
                  disabled={loadingAdjust || !stockItem}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingAdjust ? "Procesando..." : "Confirmar Ajuste"}
                </button>
              </div>
            </form>
          </div>

          {/* 4. Historial de Movimientos */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  Historial de Movimientos (Kardex)
                </h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-500 font-medium">
                   <tr>
                     <th className="px-4 py-3">Fecha</th>
                     <th className="px-4 py-3">Tipo</th>
                     <th className="px-4 py-3 text-right">Cantidad</th>
                     <th className="px-4 py-3">Motivo</th>
                     <th className="px-4 py-3">Ref.</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {movements.length > 0 ? movements.map((mov) => (
                     <tr key={mov.id} className="hover:bg-gray-50">
                       <td className="px-4 py-3 text-gray-600">
                         {new Date(mov.createdAt).toLocaleString()}
                       </td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-medium ${
                           mov.type.includes('_IN') 
                             ? 'bg-green-100 text-green-700' 
                             : 'bg-red-100 text-red-700'
                         }`}>
                           {mov.type.replace('_', ' ')}
                         </span>
                       </td>
                       <td className={`px-4 py-3 text-right font-mono font-bold ${
                          mov.type.includes('_IN') ? 'text-green-600' : 'text-red-600'
                       }`}>
                         {mov.type.includes('_IN') ? '+' : '-'}{mov.quantity}
                       </td>
                       <td className="px-4 py-3 text-gray-600">{mov.reason}</td>
                       <td className="px-4 py-3 text-xs text-gray-400">
                         {mov.referenceType}
                         {mov.notes && <div className="italic truncate max-w-[150px]">{mov.notes}</div>}
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                         <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                         Sin movimientos registrados
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};