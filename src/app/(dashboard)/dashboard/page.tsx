"use client";
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { Package, ShoppingCart, Warehouse, TrendingUp, Users, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: "Productos",
      value: "1,234",
      icon: Package,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "Total en catálogo"
    },
    {
      title: "Ventas Hoy",
      value: "$2,450",
      icon: ShoppingCart,
      color: "bg-green-100",
      iconColor: "text-green-600",
      description: "Ingresos del día"
    },
    {
      title: "Inventario",
      value: "856",
      icon: Warehouse,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "Unidades disponibles"
    },
    {
      title: "Crecimiento",
      value: "+12.5%",
      icon: TrendingUp,
      color: "bg-amber-100",
      iconColor: "text-amber-600",
      description: "Mes anterior"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2 text-lg">Bienvenido, <span className="font-semibold text-gray-800">{user?.username}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">¡Hola, {user?.username}!</h2>
            <p className="text-blue-100 mt-2">
              Tu rol es <span className="font-semibold">{user?.role}</span>. Tienes acceso a todas las funciones correspondientes a tu nivel.
            </p>
          </div>
          <Users className="w-12 h-12 opacity-20" />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Acceso Rápido</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Navega rápidamente a las secciones principales usando el menú superior.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Catálogo de productos</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Gestión de ventas</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-600 rounded-full"></span>Control de inventario</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Monitorea el rendimiento y desempeño de tu negocio en tiempo real.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tasa de conversión</span>
              <span className="font-semibold text-green-600">2.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Ticket promedio</span>
              <span className="font-semibold text-green-600">$145</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}