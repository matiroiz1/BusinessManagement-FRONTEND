"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchClient } from "@/src/shared/infrastructure/api-client";
import { inventoryService } from "@/src/modules/inventory/services/inventory.service";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { 
  DollarSign, ShoppingBag, AlertTriangle, Package, 
  TrendingUp, Activity, X 
} from "lucide-react";

interface DashboardMetrics {
  todaySalesTotal: number;
  todayNetProfit: number;
  todayTransactions: number;
  criticalStockItems: number;
  activeProducts: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Críticos
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [criticalItems, setCriticalItems] = useState<any[]>([]);
  const [loadingCritical, setLoadingCritical] = useState(false);

  useEffect(() => {
    apiFetchClient("/dashboard/metrics")
      .then(setMetrics)
      .catch((err) => console.error("Error cargando métricas:", err))
      .finally(() => setLoading(false));
  }, []);

  // Función para manejar el clic en Stock Crítico
  const handleCriticalClick = async () => {
    if (!metrics || metrics.criticalStockItems === 0) return;
    
    setShowCriticalModal(true);
    setLoadingCritical(true);
    try {
      const items = await inventoryService.getCriticalItems();
      const products = await catalogService.getAllProducts();
      
      const enrichedItems = items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return { ...item, productName: prod?.name || "Producto Desconocido", sku: prod?.sku };
      });

      setCriticalItems(enrichedItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCritical(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resumen General</h1>
        <p className="text-gray-500">Bienvenido de nuevo. Aquí tienes el estado de tu negocio hoy.</p>
      </div>

      {/* Grid de KPIs Interactivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* KPI 1: Ventas (Facturación) - AZUL */}
        <KpiCard 
          title="Facturación Hoy"
          value={loading ? "..." : `$${metrics?.todaySalesTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          color="blue"
          footer="Total bruto vendido"
          onClick={() => router.push('/dashboard/sales?tab=history')} 
        />

        {/* KPI 2: GANANCIA - VERDE */}
        <KpiCard 
          title="Ganancia Estimada"
          value={loading ? "..." : `$${metrics?.todayNetProfit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          color="green"
          footer="Rentabilidad del día (Venta - Costo)"
          onClick={() => router.push('/dashboard/sales?tab=history')} 
        />

        {/* KPI 3: Transacciones - VIOLETA */}
        <KpiCard 
          title="Transacciones"
          value={loading ? "..." : metrics?.todayTransactions.toString()}
          icon={<ShoppingBag className="w-6 h-6 text-purple-600" />}
          color="purple"
          footer="Tickets generados hoy"
          onClick={() => router.push('/dashboard/sales?tab=history')} 
        />

        {/* KPI 4: Stock Crítico - ROJO */}
        <KpiCard 
          title="Stock Crítico"
          value={loading ? "..." : metrics?.criticalStockItems.toString()}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="red"
          isAlert={metrics && metrics.criticalStockItems > 0}
          footer="Productos requieren reposición"
          onClick={handleCriticalClick} 
        />
      </div>

      {/* Sección Decorativa */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Próximamente: Análisis Inteligente
          </h2>
          <p className="text-blue-100 max-w-xl">
            El módulo de IA analizará tus tendencias.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
           <TrendingUp className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* MODAL DE STOCK CRÍTICO */}
      {showCriticalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-red-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Reporte de Stock Crítico
              </h3>
              <button 
                onClick={() => setShowCriticalModal(false)}
                className="p-2 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingCritical ? (
                <div className="text-center py-8 text-gray-500">Cargando detalles...</div>
              ) : (
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-red-50 text-red-700 font-medium">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Producto</th>
                      <th className="px-4 py-3 text-right">Actual</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Mínimo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {criticalItems.map((item) => (
                      <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">
                          {item.onHand}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {item.criticalThreshold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setShowCriticalModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// KPI CARD REDISEÑADA - BORDES PERMANENTES Y EFECTOS FUERTES
// ----------------------------------------------------------------------
const KpiCard = ({ title, value, icon, footer, color, isAlert, onClick }: any) => {
  
  // Configuración de colores:
  // - default: Borde suave alrededor (border-COLOR-200) + Borde grueso izq (border-l-COLOR-500)
  // - hover: Fondo suave (bg-COLOR-50) + Borde medio alrededor (border-COLOR-300)
  const styles: any = {
    green: {
      card: "border-emerald-200 border-l-emerald-500 hover:bg-emerald-50 hover:border-emerald-300",
      iconBg: isAlert ? 'bg-red-100' : 'bg-emerald-100'
    },
    blue: {
      card: "border-blue-200 border-l-blue-500 hover:bg-blue-50 hover:border-blue-300",
      iconBg: 'bg-blue-100'
    },
    red: {
      card: "border-red-200 border-l-red-500 hover:bg-red-50 hover:border-red-300",
      iconBg: 'bg-red-100'
    },
    purple: {
      card: "border-purple-200 border-l-purple-500 hover:bg-purple-50 hover:border-purple-300",
      iconBg: 'bg-purple-100'
    },
  };

  const currentStyle = styles[color];

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white rounded-xl shadow-sm p-6 
        border border-l-4  /* Aplicamos borde general y borde izq grueso */
        ${currentStyle.card} /* Inyectamos los colores específicos */
        ${isAlert ? 'bg-red-50/30' : ''} 
        cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]
        group
      `}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-gray-700 transition-colors">{title}</p>
          <h3 className={`text-2xl font-bold ${isAlert ? 'text-red-700' : 'text-gray-900'}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${currentStyle.iconBg} transition-transform group-hover:rotate-12`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs ${isAlert ? 'text-red-600 font-medium' : 'text-gray-400 group-hover:text-gray-600'} relative z-10`}>
        {footer}
      </p>
    </div>
  );
};