"use client";
import { useState, useEffect } from "react";
import { salesService } from "@/src/modules/sales/services/sales.service";
import { SaleResponse } from "../types";
import { FileText, Calendar, User } from "lucide-react";

export const SalesHistory = () => {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await salesService.getAll();
      // Ordenar por fecha descendente
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando historial...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">ID Venta</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                 <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {sale.id.split('-')[0]}...
                 </td>
                 <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-gray-400" />
                       {new Date(sale.createdAt).toLocaleString()}
                    </div>
                 </td>
                 <td className="px-6 py-4 text-gray-700">
                    {sale.customerName ? (
                       <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          {sale.customerName}
                       </div>
                    ) : <span className="text-gray-400 italic">Consumidor Final</span>}
                 </td>
                 <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                       sale.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                       {sale.status === 'CONFIRMED' ? 'Confirmada' : 'Borrador'}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${sale.total.toFixed(2)}
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};