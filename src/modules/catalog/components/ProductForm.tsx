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
          
          if (data.currentCost > 0) {
            const margin = ((data.currentSalePrice - data.currentCost) / data.currentCost) * 100;
            setProfitMargin(parseFloat(margin.toFixed(1)));
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

  const toggleActive = () => {
    setFormData(prev => ({ ...prev, active: !prev.active }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCost = Number(e.target.value);
    const newPrice = newCost * (1 + profitMargin / 100);
    setFormData(prev => ({ ...prev, currentCost: newCost, currentSalePrice: parseFloat(newPrice.toFixed(2)) }));
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMargin = Number(e.target.value);
    setProfitMargin(newMargin);
    const newPrice = formData.currentCost * (1 + newMargin / 100);
    setFormData(prev => ({ ...prev, currentSalePrice: parseFloat(newPrice.toFixed(2)) }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(e.target.value);
    let calculatedMargin = 0;
    if (formData.currentCost > 0) {
      calculatedMargin = ((newPrice - formData.currentCost) / formData.currentCost) * 100;
    }
    setProfitMargin(parseFloat(calculatedMargin.toFixed(2)));
    setFormData(prev => ({ ...prev, currentSalePrice: newPrice }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && productId) {
        await catalogService.updateProduct(productId, formData);
        toast.success("Producto actualizado correctamente");
      } else {
        await catalogService.createProduct(formData);
        toast.success("Producto creado correctamente");
      }
      router.push("/dashboard/catalog");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const netProfit = formData.currentSalePrice - formData.currentCost;

  if (fetchingMasters) return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {isEditMode ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        {isEditMode && (
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${formData.active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <span className={`text-sm font-bold ${formData.active ? 'text-green-700' : 'text-red-700'}`}>
              {formData.active ? 'ACTIVO' : 'INACTIVO'}
            </span>
            <button
              type="button"
              onClick={toggleActive}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${formData.active ? 'bg-green-600 focus:ring-green-500' : 'bg-gray-300 focus:ring-red-500'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Identificación</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU *</label>
            <input 
                name="sku" 
                required 
                onChange={handleChange} 
                value={formData.sku}
                disabled={isEditMode} 
                className={`w-full mt-1 p-2 border rounded-lg text-gray-800 ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`} 
                placeholder="EJ: REF-001" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input 
                name="name" 
                required 
                onChange={handleChange} 
                value={formData.name} 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" 
                placeholder="Ej: Monitor LED 24 pulgadas" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
            <input 
                name="barcode" 
                onChange={handleChange} 
                value={formData.barcode} 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" 
                placeholder="Ej: 7791234567890"
            />
          </div>
        </div>

        {/* Clasificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Clasificación</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo *</label>
            <select name="productTypeId" required onChange={handleChange} value={formData.productTypeId} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado Producto *</label>
            <select name="productStatusId" required onChange={handleChange} value={formData.productStatusId} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad *</label>
            <select name="unitMeasureId" required onChange={handleChange} value={formData.unitMeasureId} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
            </select>
          </div>
        </div>

        {/* Panel de Precios */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-2">
             <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Estructura de Precios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Costo</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="number" min="0" step="0.01" value={formData.currentCost} onChange={handleCostChange} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-gray-800" placeholder="0.00" /></div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-blue-600 mb-1">Margen %</label>
                    <div className="relative"><Percent className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                    <input type="number" step="0.1" value={profitMargin} onChange={handleMarginChange} className="w-full pl-9 pr-4 py-2 border-2 border-blue-100 rounded-lg text-blue-700 font-bold" placeholder="30" /></div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Venta</label>
                    <div className="relative"><DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-green-500" />
                    <input type="number" min="0" step="0.01" value={formData.currentSalePrice} onChange={handlePriceChange} className="w-full pl-9 pr-4 py-2 border border-green-200 rounded-lg text-green-800 font-bold" placeholder="0.00" /></div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-sm">
              <span className="text-gray-500">Ganancia neta:</span>
              <span className={`font-bold px-3 py-1 rounded-full ${netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>${netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea 
            name="description" 
            rows={3} 
            onChange={handleChange} 
            value={formData.description} 
            className="w-full mt-1 p-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej: Resolución Full HD, incluye cable HDMI, garantía de 1 año..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
        <Link href="/dashboard/catalog" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <X className="w-4 h-4" /> Cancelar
        </Link>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? "Actualizar Producto" : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
};