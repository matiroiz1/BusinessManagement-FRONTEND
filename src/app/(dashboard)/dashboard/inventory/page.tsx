"use client";
import { useState } from "react";
import { StockInitializer } from "@/src/modules/inventory/components/StockInitializer";
import { ProductInventoryManager } from "@/src/modules/inventory/components/ProductInventoryManager";
import { ClipboardList, PackagePlus, Info } from "lucide-react";

export default function InventoryPage() {
  // 'manage' = Día a día | 'initialize' = Primera vez
  const [activeTab, setActiveTab] = useState<'manage' | 'initialize'>('manage');

  return (
    <div className="max-w-7xl mx-auto py-6">
      
      {/* Encabezado Principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-500">Administra las existencias de tu depósito.</p>
      </div>

      {/* --- NUEVA NAVEGACIÓN INTUITIVA --- */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-8 inline-flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        
        {/* Opción 1: Gestión Diaria */}
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 text-left sm:text-center ${
            activeTab === 'manage' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className={`p-2 rounded-md ${activeTab === 'manage' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-bold text-sm">Control de Existencias</span>
            <span className="block text-xs opacity-80 font-medium">Ver stock, ajustar y Kardex</span>
          </div>
        </button>

        {/* Opción 2: Carga Inicial (Lo que pediste cambiar) */}
        <button
          onClick={() => setActiveTab('initialize')}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 text-left sm:text-center ${
            activeTab === 'initialize' 
              ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className={`p-2 rounded-md ${activeTab === 'initialize' ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-bold text-sm">Cargar Stock Inicial</span>
            <span className="block text-xs opacity-80 font-medium">Para productos nuevos (Cero stock)</span>
          </div>
        </button>

      </div>

      {/* Barra de Ayuda Contextual (Explica qué hace la pantalla actual) */}
      <div className="mb-6 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <Info className="w-4 h-4 mt-0.5 text-blue-500" />
        {activeTab === 'manage' ? (
          <p>
            Usa esta sección para el <strong>día a día</strong>: consultar cuánto hay de un producto, 
            registrar roturas, pérdidas o ajustes manuales, y ver el historial de movimientos.
          </p>
        ) : (
          <p>
            Usa esta sección <strong>solo cuando creas un producto nuevo</strong> en el catálogo. 
            Aquí le asignas su cantidad inicial y defines cuándo quieres que el sistema te avise por stock bajo.
          </p>
        )}
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