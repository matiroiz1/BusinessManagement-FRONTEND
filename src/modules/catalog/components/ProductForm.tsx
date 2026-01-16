"use client";
import { useState, useEffect } from "react";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { catalogService } from "../services/catalog.service";
import { Calculator, DollarSign, Loader2, Percent, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductFormProps {
  productId?: string;
}

export const ProductForm = ({ productId }: ProductFormProps) => {
  const router = useRouter();
  const { types, statuses, units, fetchingMasters } = useCreateProduct();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!productId;

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    barcode: "",
    productTypeId: "",
    productStatusId: "",
    unitMeasureId: "",
    currentSalePrice: 0,
    currentCost: 0,
    active: true,
  });

  const [profitMargin, setProfitMargin] = useState<number>(30);

  useEffect(() => {
    if (isEditMode && productId) {
      setLoading(true);
      catalogService.getProductById(productId)
        .then((data) => {
          setFormData({
            sku: data.sku,
            name: data.name,
            description: data.description || "",
            barcode: data.barcode || "",
            productTypeId: data.productTypeId,
            productStatusId: data.productStatusId,
            unitMeasureId: data.unitMeasureId,
            currentSalePrice: data.currentSalePrice,
            currentCost: data.currentCost,
            active: data.active
          });
          
          // Cálculo de margen inverso al cargar: (PV - Costo) / PV
          if (data.currentSalePrice > 0) {
            const margin = ((data.currentSalePrice - data.currentCost) / data.currentSalePrice) * 100;
            setProfitMargin(parseFloat(margin.toFixed(2)));
          }
        })
        .catch(() => toast.error("Error al cargar producto"))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  // --- LÓGICA DE MARGEN REAL (DIVIDIR POR 1 - MARGEN) ---

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCost = Number(e.target.value);
    
    // Formula: Precio = Costo / (1 - Margen%)
    const divisor = 1 - (profitMargin / 100);
    const newPrice = divisor > 0 ? newCost / divisor : 0;
    
    setFormData(prev => ({
      ...prev,
      currentCost: newCost,
      currentSalePrice: parseFloat(newPrice.toFixed(2))
    }));
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMargin = Number(e.target.value);
    
    // El margen no puede ser 100% o más porque el divisor sería 0 o negativo
    if (newMargin >= 100) newMargin = 99.9; 
    setProfitMargin(newMargin);

    const divisor = 1 - (newMargin / 100);
    const newPrice = divisor > 0 ? formData.currentCost / divisor : 0;
    
    setFormData(prev => ({
      ...prev,
      currentSalePrice: parseFloat(newPrice.toFixed(2))
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(e.target.value);
    
    // Formula Inversa para sacar el Margen Real: (Precio - Costo) / Precio
    let calculatedMargin = 0;
    if (newPrice > 0) {
      calculatedMargin = ((newPrice - formData.currentCost) / newPrice) * 100;
    }

    setProfitMargin(parseFloat(calculatedMargin.toFixed(2)));
    setFormData(prev => ({
      ...prev,
      currentSalePrice: newPrice
    }));
  };

  // -----------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && productId) {
        await catalogService.updateProduct(productId, formData);
        toast.success("Producto actualizado");
      } else {
        await catalogService.createProduct(formData);
        toast.success("Producto creado");
      }
      router.push("/dashboard/catalog");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const netProfit = formData.currentSalePrice - formData.currentCost;

  if (fetchingMasters) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Identificación</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU *</label>
            <input name="sku" required onChange={handleChange} value={formData.sku} disabled={isEditMode} className={`w-full mt-1 p-2 border rounded-lg ${isEditMode ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500'}`} placeholder="REF-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input name="name" required onChange={handleChange} value={formData.name} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="Ej: Monitor LED 24" />
          </div>
        </div>

        {/* Clasificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Clasificación</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select name="productTypeId" required onChange={handleChange} value={formData.productTypeId} className="w-full mt-1 p-2 border rounded-lg text-gray-800">
                    <option value="">Seleccionar...</option>
                    {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                <select name="unitMeasureId" required onChange={handleChange} value={formData.unitMeasureId} className="w-full mt-1 p-2 border rounded-lg text-gray-800">
                    <option value="">Seleccionar...</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>
          </div>
        </div>

        {/* Panel de Precios con MARGEN REAL */}
        <div className="md:col-span-2">
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mt-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-blue-800 uppercase flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Estructura de Margen Real
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">MÉTODO: COSTO / (1 - MARGEN)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 italic">PRECIO DE COSTO</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="number" step="0.01" value={formData.currentCost} onChange={handleCostChange} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-800" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600 mb-1">MARGEN DE UTILIDAD (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                  <input type="number" step="0.1" value={profitMargin} onChange={handleMarginChange} className="w-full pl-9 pr-4 py-2 border-2 border-blue-200 bg-white rounded-lg font-bold text-blue-700" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 italic">PRECIO DE VENTA FINAL</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-green-500" />
                  <input type="number" step="0.01" value={formData.currentSalePrice} onChange={handlePriceChange} className="w-full pl-9 pr-4 py-2 border border-green-200 bg-green-50 rounded-lg font-bold text-green-800" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-6 text-sm border-t border-blue-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Markup (Recargo sobre costo):</span>
                <span className="font-mono font-bold text-gray-700">
                    {formData.currentCost > 0 ? (((formData.currentSalePrice - formData.currentCost) / formData.currentCost) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Ganancia Neta:</span>
                <span className={`font-bold px-3 py-1 rounded-full ${netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    ${netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
        <Link href="/dashboard/catalog" className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">Cancelar</Link>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
};