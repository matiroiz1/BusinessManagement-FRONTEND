"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { catalogService } from "@/src/modules/catalog/services/catalog.service";
import { 
  Edit, Trash2, Plus, Search, Package, AlertCircle, 
  AlertTriangle, Filter, X 
} from "lucide-react";
import { toast } from "sonner";

export const ProductList = () => {
  const router = useRouter();
  
  // Datos
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Para el filtro
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Modal de borrado
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false, id: null, name: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargamos productos y categorías en paralelo
      const [productsData, categoriesData] = await Promise.all([
        catalogService.getAllProducts(),
        catalogService.getProductTypes()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Error al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: any) => {
    setDeleteModal({ open: true, id: product.id, name: product.name });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await catalogService.deleteProduct(deleteModal.id);
      toast.success("Producto desactivado correctamente");
      
      // Recargamos solo los productos
      const updatedProducts = await catalogService.getAllProducts();
      setProducts(updatedProducts);
      
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setDeleteModal({ open: false, id: null, name: "" });
    }
  };

  // --- LÓGICA DE BÚSQUEDA AVANZADA ---
  
  // 1. Función para quitar tildes y pasar a minúsculas
  // Ej: "Café" -> "cafe"
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // 2. Filtro combinado
  const filteredProducts = products.filter(p => {
    const term = normalizeText(searchTerm);
    const name = normalizeText(p.name);
    const sku = normalizeText(p.sku);

    // Coincidencia de texto (Nombre o SKU)
    const matchesSearch = name.includes(term) || sku.includes(term);

    // Coincidencia de categoría (Si hay una seleccionada)
    const matchesCategory = selectedCategory 
      ? p.productTypeId === selectedCategory 
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Header y Filtros */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          
          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de Categoría */}
          <div className="relative w-full sm:w-60">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white appearance-none cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {/* Flechita decorativa del select */}
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Botón limpiar filtros (solo si hay filtros activos) */}
          {(searchTerm || selectedCategory) && (
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
              className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> Limpiar
            </button>
          )}

        </div>

        {/* Botón Nuevo */}
        <button 
          onClick={() => router.push("/dashboard/catalog/new")}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-sm transition-all hover:shadow-md whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3 text-right">Precio Venta</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <Package className="w-4 h-4" />
                      </div>
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-6 py-3 text-gray-500">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                      {product.productTypeName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-gray-700">
                    ${product.currentSalePrice?.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  {/* Botones de acción */}
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/catalog/edit/${product.id}`)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg border border-blue-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:bg-red-100"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                 <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No se encontraron productos</p>
              <p className="text-sm">Prueba ajustando los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-gray-100">
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Desactivar producto?</h3>
              <p className="text-gray-500 mb-6">
                Estás a punto de desactivar <strong>"{deleteModal.name}"</strong>. 
                Dejará de estar disponible para nuevas ventas.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteModal({ open: false, id: null, name: "" })}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  Sí, desactivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};