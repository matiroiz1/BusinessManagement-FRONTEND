import { ProductForm } from "@/src/modules/catalog/components/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/dashboard/catalog" 
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
          <p className="text-sm text-gray-500">Complete la información para registrar un ítem en el inventario.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}