"use client";
import { useParams } from "next/navigation";
import { ProductForm } from "@/src/modules/catalog/components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
        <p className="text-gray-500">Modificar información existente</p>
      </div>
      
      {/* Pasamos el ID al formulario para que active el modo edición */}
      <ProductForm productId={id} />
    </div>
  );
}