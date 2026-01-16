"use client";
import { useState } from "react";
import { StockInitializer } from "@/src/modules/inventory/components/StockInitializer";
import { ProductInventoryManager } from "@/src/modules/inventory/components/ProductInventoryManager"; // <--- Nuevo import
import { PackagePlus, BarChart3 } from "lucide-react";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'initialize' | 'manage'>('manage');

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
        <p className="text-gray-600">Controla el stock, movimientos y alertas de tus productos.</p>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'manage' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Gestión Diaria y Kardex
        </button>
        <button
          onClick={() => setActiveTab('initialize')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'initialize' 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          Inicializar Productos Nuevos
        </button>
      </div>

      {/* Contenido Dinámico */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'manage' ? (
          <ProductInventoryManager />
        ) : (
          <StockInitializer />
        )}
      </div>
    </div>
  );
}