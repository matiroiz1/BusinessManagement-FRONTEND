"use client";
import { useState, useEffect, Suspense } from "react"; // Suspense es necesario para searchParams en Next.js
import { useSearchParams } from "next/navigation";
import { PointOfSale } from "@/src/modules/sales/components/PointOfSale";
import { SalesHistory } from "@/src/modules/sales/components/SalesHistory";
import { LayoutGrid, List } from "lucide-react";

// Componente interno que usa searchParams
function SalesPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  // Efecto: Si la URL dice ?tab=history, cambiamos la pestaña
  useEffect(() => {
    if (searchParams.get("tab") === "history") {
      setActiveTab("history");
    }
  }, [searchParams]);

  return (
    <div className="max-w-[1600px] mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-sm text-gray-500">Gestiona ventas y facturación</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'pos' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Nueva Venta
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'history' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            Historial
          </button>
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'pos' ? <PointOfSale /> : <SalesHistory />}
      </div>
    </div>
  );
}

// Componente Principal envuelto en Suspense (Requisito de Next.js para useSearchParams)
export default function SalesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SalesPageContent />
    </Suspense>
  );
}