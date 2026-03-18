"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// Iconos
import { ShoppingCart, Package, Menu, Loader2, LogOut, LogIn, User, X } from "lucide-react";

// Stores y Servicios
import { useAuthStore } from "@/src/modules/auth/store/authStore";
import { useCartStore } from "@/src/modules/shop/store/useCartStore";
import { authService } from "@/src/modules/auth/services/auth.service";

// Componentes
import { SearchInput } from "./SearchInput"; 

export const ShopHeader = () => {
  // Hooks de Auth
  const { user, logout, setUser, setToken } = useAuthStore();
  
  // Hooks de Carrito (Usamos itemCount como tenías en tu versión)
  const { itemCount, loadCart } = useCartStore();
  
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- EFECTO DE INICIALIZACIÓN (AUTH + CART) ---
  useEffect(() => {
    setMounted(true);

    // 1. Cargar el Carrito
    loadCart();

    // 2. Recuperar Sesión de Usuario si existe cookie
    const cookieToken = Cookies.get("auth_token");
    if (cookieToken && !user) {
        setToken(cookieToken);
        authService.getMe()
            .then((userData) => {
                setUser({
                    userId: userData.userId,
                    username: userData.username,
                    role: userData.role
                });
            })
            .catch(() => logout());
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
    router.refresh();
  };

  // Evitar Hydration Mismatch
  if (!mounted) return <div className="h-16 bg-white/80 border-b border-gray-200"></div>;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors shadow-sm">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
            GestCom<span className="text-blue-600">Store</span>
          </span>
          <span className="font-bold text-xl text-gray-900 tracking-tight sm:hidden">GC</span>
        </Link>

        {/* 2. BUSCADOR (Central y Flexible) */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
            <SearchInput />
        </div>

        {/* 3. NAVEGACIÓN DERECHA */}
        <nav className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          
          {/* Lógica de Usuario (Logueado vs Invitado) */}
          <div className="hidden md:flex items-center">
            {user ? (
              // --- USUARIO LOGUEADO ---
              <div className="flex items-center gap-3 border-r border-gray-200 pr-4 mr-2">
                 <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-gray-800 leading-none">{user.username}</p>
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">Mi Cuenta</p>
                 </div>
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user.username.charAt(0).toUpperCase()}
                 </div>
                 <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Cerrar sesión"
                 >
                    {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                 </button>
              </div>
            ) : (
              // --- USUARIO INVITADO ---
              <Link 
                href="/login" 
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-2"
              >
                <User className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>

          {/* CARRITO (Siempre visible) */}
          <Link href="/cart" className="relative group">
            <div className="p-2 hover:bg-blue-50 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
              
              {/* Badge Contador */}
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              )}
            </div>
          </Link>

          {/* Menú Móvil Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* --- DESPLEGABLE MÓVIL --- */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 shadow-lg animate-in slide-in-from-top-5 absolute w-full">
            {/* Buscador en Móvil */}
            <div className="mb-4">
                <SearchInput />
            </div>

            {user ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">Sesión activa</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 border border-red-100 bg-red-50 rounded-xl font-medium"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            ) : (
                <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white p-3 rounded-xl font-medium"
                >
                    <LogIn className="w-4 h-4" /> Iniciar Sesión
                </Link>
            )}
        </div>
      )}
    </header>
  );
};