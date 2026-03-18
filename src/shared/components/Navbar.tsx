"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { authService } from "@/src/modules/auth/services/auth.service"; // Importamos el servicio
import { ShoppingCart, Package, Warehouse, LogOut, Menu, Loader2, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export const Navbar = () => {
  const { user, logout, setUser, setToken } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. RECUPERACIÓN DE SESIÓN (HYDRATION)
  // Este efecto se ejecuta solo una vez al cargar la página en el navegador.
  useEffect(() => {
    setMounted(true);
    const cookieToken = Cookies.get("auth_token");
    
    // Si existe la cookie (sesión abierta) pero el store de Zustand está vacío (porque se recargó la página)
    if (cookieToken && !user) {
        // A. Restauramos el token en el store para que las futuras peticiones funcionen
        setToken(cookieToken);

        // B. Llamamos al backend para recuperar los datos del usuario (username, role)
        authService.getMe()
            .then((userData) => {
                setUser({
                    userId: userData.userId,
                    username: userData.username,
                    role: userData.role
                });
            })
            .catch(() => {
                // Si el token expiró o es inválido, limpiamos todo para forzar login limpio
                logout();
            });
    }
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout(); 
    router.push("/login");
    router.refresh();
  };

  // Evitar renderizado incorrecto en el servidor (Hydration Mismatch)
  if (!mounted) return <div className="h-16 bg-white shadow-md"></div>;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
              <span className="text-white font-bold text-lg">GC</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold text-gray-900">GestCom</p>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center space-x-1">
             {/* Solo mostramos links de dashboard si tiene rol adecuado */}
             {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SELLER') && (
               <>
                <Link href="/dashboard/catalog" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard/catalog') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Package className="w-4 h-4" /> Catálogo
                </Link>
                <Link href="/dashboard/sales" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard/sales') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <ShoppingCart className="w-4 h-4" /> Ventas
                </Link>
               </>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'WAREHOUSE_OPERATOR') && (
              <Link href="/dashboard/inventory" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard/inventory') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Warehouse className="w-4 h-4" /> Inventario
              </Link>
            )}
          </div>

          {/* USER MENU */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right border-r border-gray-200 pr-4">
                  <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
                </div>
                
                <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all border border-red-200">
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                <LogIn className="w-4 h-4" />
                Ingresar
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 p-4 space-y-2">
            {/* ... lógica de menú móvil ... */}
            
            {user ? (
                <div className="pt-4 border-t border-gray-200 mt-2">
                    <p className="text-sm font-bold text-gray-900 mb-2">{user.username}</p>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 bg-white text-red-600 border border-gray-200 rounded-lg">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            ) : (
                <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold">
                    Iniciar Sesión
                </Link>
            )}
        </div>
      )}
    </nav>
  );
};