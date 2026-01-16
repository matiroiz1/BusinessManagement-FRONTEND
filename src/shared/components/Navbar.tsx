"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { ShoppingCart, Package, Warehouse, LogOut, Menu, User, Loader2 } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => 
    pathname.startsWith(path);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // La redirección se maneja en el store
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <span className="text-white font-bold text-lg">GC</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold text-gray-900">GestCom</p>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/dashboard/catalog" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard/catalog')
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              Catálogo
            </Link>

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SELLER') && (
              <Link 
                href="/dashboard/sales" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard/sales')
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Ventas
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'WAREHOUSE_OPERATOR') && (
              <Link 
                href="/dashboard/inventory" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard/inventory')
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Warehouse className="w-4 h-4" />
                Inventario
              </Link>
            )}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right border-r border-gray-200 pr-4">
              <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/dashboard/catalog" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
            >
              <Package className="w-4 h-4" />
              Catálogo
            </Link>

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SELLER') && (
              <Link 
                href="/dashboard/sales" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Ventas
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'WAREHOUSE_OPERATOR') && (
              <Link 
                href="/dashboard/inventory" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
              >
                <Warehouse className="w-4 h-4" />
                Inventario
              </Link>
            )}

            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-sm font-semibold text-gray-900 px-3 mb-2">{user?.username}</p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};