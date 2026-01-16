"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PointOfSale } from "@/src/modules/sales/components/PointOfSale";
import { SalesHistory } from "@/src/modules/sales/components/SalesHistory";
import { LayoutGrid, List } from "lucide-react";

function SalesPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  useEffect(() => {
    if (searchParams.get("tab") === "history") {
      setActiveTab("history");
    }
  }, [searchParams]);

  return (
    <div className="max-w-[1600px] mx-auto p-4">
      
      {/* HEADER + SELECTOR DE VISTAS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-sm text-gray-500">Gestiona ventas y facturación</p>
        </div>

        {/* --- AQUÍ ESTÁ EL CAMBIO DE DISEÑO --- */}
        <div className="bg-gray-100 p-1.5 rounded-xl border border-gray-200 inline-flex shadow-inner">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'pos' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5 font-bold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${activeTab === 'pos' ? 'text-blue-600' : 'text-gray-400'}`} />
            Nueva Venta
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'history' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5 font-bold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
            }`}
          >
            <List className={`w-4 h-4 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400'}`} />
            Historial
          </button>
        </div>
        {/* ------------------------------------- */}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'pos' ? <PointOfSale /> : <SalesHistory />}
      </div>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SalesPageContent />
    </Suspense>
  );
}