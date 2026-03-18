"use client";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // npm install use-debounce (Opcional, o usa timeout simple)

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Función para manejar el input con un pequeño retraso (para no recargar en cada tecla)
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar productos..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-800"
      />
    </div>
  );
};