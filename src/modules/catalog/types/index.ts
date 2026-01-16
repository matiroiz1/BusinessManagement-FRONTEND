// Datos para los Dropdowns (Maestros)
export interface ProductType {
  id: string;
  name: string;
}

export interface ProductStatus {
  id: string;
  name: string;
}

export interface UnitMeasure {
  id: string;
  code: string;
  name: string;
}

// El contrato para crear un producto
export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  productTypeId: string;     // UUID seleccionado
  productStatusId: string;   // UUID seleccionado
  unitMeasureId: string;     // UUID seleccionado
  currentSalePrice: number;
  currentCost: number;
  active: boolean;
}