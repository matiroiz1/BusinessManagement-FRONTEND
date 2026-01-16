import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { catalogService } from "../services/catalog.service";
import { ProductType, ProductStatus, UnitMeasure, CreateProductRequest } from "../types";

export const useCreateProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingMasters, setFetchingMasters] = useState(true);
  
  // Estado para los dropdowns
  const [types, setTypes] = useState<ProductType[]>([]);
  const [statuses, setStatuses] = useState<ProductStatus[]>([]);
  const [units, setUnits] = useState<UnitMeasure[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [typesData, statusesData, unitsData] = await Promise.all([
          catalogService.getProductTypes(),
          catalogService.getProductStatuses(),
          catalogService.getUnitMeasures(),
        ]);
        setTypes(typesData);
        setStatuses(statusesData);
        setUnits(unitsData);
      } catch (error) {
        console.error("Error cargando maestros:", error);
        alert("Error al cargar las listas desplegables");
      } finally {
        setFetchingMasters(false);
      }
    };
    loadMasters();
  }, []);

  // Función de guardado
  const saveProduct = async (data: CreateProductRequest) => {
    setLoading(true);
    try {
      await catalogService.createProduct(data);
      router.push("/dashboard/catalog"); // Redirigir al listado
      router.refresh(); // Refrescar caché de Next.js
    } catch (error: any) {
      alert(error.message || "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return {
    types,
    statuses,
    units,
    loading,
    fetchingMasters,
    saveProduct,
  };
};