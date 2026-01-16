"use client";
import { useState, useEffect, useRef } from "react";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { StockItemResponse, StockMovementResponse } from "../types";
import { toast } from "sonner";
import { 
  Search, RefreshCw, ArrowUpCircle, ArrowDownCircle, 
  History, AlertCircle, CheckCircle, Package, FileText, AlertTriangle, X 
} from "lucide-react";

export const ProductInventoryManager = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  
  // -- LÓGICA DE BÚSQUEDA DE PRODUCTOS --
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados de datos
  const [stockItem, setStockItem] = useState<StockItemResponse | null>(null);
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Formulario
  const [adjustForm, setAdjustForm] = useState({
    quantity: 0,
    direction: "IN",
    reason: "Corrección de Inventario",
    notes: ""
  });
  const [loadingAdjust, setLoadingAdjust] = useState(false);

  useEffect(() => {
    catalogService.getAllProducts().then(setProducts).catch(console.error);
    
    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductData(selectedProduct.id);
    } else {
      setStockItem(null);
      setMovements([]);
    }
  }, [selectedProduct]);

  const loadProductData = async (productId: string) => {
    setLoadingData(true);
    try {
      const stockData = await inventoryService.getStock(productId);
      if (stockData) {
        const movementsData = await inventoryService.getMovements(productId);
        setStockItem(stockData);
        setMovements(movementsData);
      } else {
        setStockItem(null);
        setMovements([]);
      }
    } catch (error) {
      console.error(error);
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
        productId: selectedProduct.id,
        quantity: Number(adjustForm.quantity),
        direction: adjustForm.direction as "IN" | "OUT",
        reason: adjustForm.reason,
        notes: adjustForm.notes,
        performedByUserId: user.userId
      });
      await loadProductData(selectedProduct.id);
      setAdjustForm({ ...adjustForm, quantity: 0, notes: "" });
      toast.success("Ajuste realizado con éxito");
    } catch (error: any) {
      toast.error(error.message || "Error al ajustar");
    } finally {
      setLoadingAdjust(false);
    }
  };

  const getStateColor = (state?: string) => {
    if (state === "CRITICAL") return "text-red-600 bg-red-50 border-red-200";
    if (state === "LOW") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  // --- Normalización de texto para búsqueda ---
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
    <div className="space-y-6">
      
      {/* 1. Selector de Producto (Buscador Mejorado) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Producto a Gestionar</label>
        
        <div className="relative" ref={dropdownRef}>
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          
          <input
            type="text"
            placeholder="Escribe para buscar por nombre o SKU..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            value={selectedProduct ? selectedProduct.name : searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedProduct(null); // Al escribir, deseleccionamos
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {/* Botón X para limpiar */}
          {(searchQuery || selectedProduct) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedProduct(null);
                setStockItem(null);
                setShowDropdown(true);
              }}
              className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Dropdown de Resultados */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSearchQuery(p.name); // Mostramos el nombre seleccionado
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 flex justify-between items-center group"
                  >
                    <div>
                       <p className="font-medium text-gray-800 group-hover:text-blue-700">{p.name}</p>
                       <p className="text-xs text-gray-400">{p.sku}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No se encontraron productos</div>
              )}
            </div>
          )}
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
            Este producto existe en el catálogo pero aún no tiene un registro de inventario.
            Debes establecer su stock inicial.
          </p>
          <div className="inline-flex bg-white px-4 py-2 rounded-lg border border-yellow-200 text-sm font-medium text-yellow-800 shadow-sm">
             Ve a la pestaña "Cargar Stock Inicial" arriba.
          </div>
        </div>
      )}

      {/* --- CASO: TODO OK --- */}
      {!loadingData && selectedProduct && stockItem && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Tarjeta de Estado */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Stock Actual
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

          {/* Formulario de Ajuste */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" /> Realizar Ajuste Manual
            </h3>
            <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
                <input type="number" min="0.01" step="0.01" required value={adjustForm.quantity} onChange={e => setAdjustForm({...adjustForm, quantity: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Tipo</label>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setAdjustForm({...adjustForm, direction: "IN"})} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border ${adjustForm.direction === 'IN' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500'}`}><ArrowUpCircle className="w-4 h-4"/> Entrada</button>
                  <button type="button" onClick={() => setAdjustForm({...adjustForm, direction: "OUT"})} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border ${adjustForm.direction === 'OUT' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-500'}`}><ArrowDownCircle className="w-4 h-4"/> Salida</button>
                </div>
              </div>
              <div>
                 <label className="block text-xs font-medium text-gray-500 uppercase">Motivo</label>
                 <select value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})} className="w-full mt-1 p-2 border rounded-lg bg-white text-gray-800">
                    <option>Corrección de Inventario</option>
                    <option>Deterioro / Rotura</option>
                    <option>Pérdida / Robo</option>
                    <option>Regalo / Bonificación</option>
                 </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Notas</label>
                <input type="text" value={adjustForm.notes} onChange={e => setAdjustForm({...adjustForm, notes: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-gray-800" placeholder="..." />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={loadingAdjust || !stockItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                  {loadingAdjust ? "Procesando..." : "Confirmar Ajuste"}
                </button>
              </div>
            </form>
          </div>

          {/* Historial */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><History className="w-5 h-5 text-gray-600" /> Historial de Movimientos (Kardex)</h3></div>
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
                       <td className="px-4 py-3 text-gray-600">{new Date(mov.createdAt).toLocaleString()}</td>
                       <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${mov.type.includes('_IN') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{mov.type.replace('_', ' ')}</span></td>
                       <td className={`px-4 py-3 text-right font-mono font-bold ${mov.type.includes('_IN') ? 'text-green-600' : 'text-red-600'}`}>{mov.type.includes('_IN') ? '+' : '-'}{mov.quantity}</td>
                       <td className="px-4 py-3 text-gray-600">{mov.reason}</td>
                       <td className="px-4 py-3 text-xs text-gray-400">{mov.referenceType}</td>
                     </tr>
                   )) : (
                     <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400"><FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />Sin movimientos registrados</td></tr>
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