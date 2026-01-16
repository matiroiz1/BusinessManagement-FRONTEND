"use client";
import { useState } from "react";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";

export const ProductForm = () => {
  const { types, statuses, units, loading, fetchingMasters, saveProduct } = useCreateProduct();

  // Estado local del formulario
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProduct(formData);
  };

  if (fetchingMasters) return <div className="p-8 text-center text-gray-500">Cargando datos maestros...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Identificación</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU *</label>
            <input name="sku" required onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="EJ: REF-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Producto *</label>
            <input name="name" required onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="Ej: Camiseta de Algodón" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
            <input name="barcode" onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" />
          </div>
        </div>

        {/* Clasificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Clasificación</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Producto *</label>
            <select name="productTypeId" required onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado *</label>
            <select name="productStatusId" required onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad de Medida *</label>
            <select name="unitMeasureId" required onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800">
              <option value="">Seleccionar...</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
            </select>
          </div>
        </div>

        {/* Precios (Ocupa todo el ancho) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Valores Económicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio de Venta *</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input name="currentSalePrice" type="number" step="0.01" required onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo Actual</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input name="currentCost" type="number" step="0.01" onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="description" rows={3} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800" />
        </div>

      </div>

      {/* Botones de Acción */}
      <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
        <Link 
          href="/dashboard/catalog"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Cancelar
        </Link>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Producto
        </button>
      </div>
    </form>
  );
};