import { ProductList } from "@/src/modules/catalog/components/ProductList";

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-gray-500 text-sm">Gestiona tus productos, precios y stock.</p>
      </div>

      <ProductList />
    </div>
  );
}