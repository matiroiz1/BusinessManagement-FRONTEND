"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authService.login({ username, password });

      setUser({
        userId: data.userId,
        username: data.username,
        role: data.role,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error de conexión. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.trim() !== "" && password !== "";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <span className="text-2xl font-bold text-blue-600">GC</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">GestCom</h2>
        <p className="text-gray-500 text-sm mt-1">Sistema de Gestión de Inventario</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Username Field */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
            Usuario o Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu@usuario.com"
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded accent-blue-600 cursor-pointer"
              disabled={loading}
            />
            <span className="text-gray-600">Recuérdame</span>
          </label>
          <a
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <span>Acceder al Sistema</span>
          )}
        </button>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>¿Necesitas ayuda? Contacta con soporte técnico</p>
        </div>
      </form>
    </div>
  );
};