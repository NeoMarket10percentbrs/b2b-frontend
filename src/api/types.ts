// API Types based on OpenAPI specification

export interface SellerCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  company_name: string;
  phone?: string;
}

export interface SellerResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  company_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerUpdate {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  company_name?: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface CategoryCreate {
  name: string;
  parent_id?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export interface CategoryUpdate {
  name?: string;
  parent_id?: string;
}

export interface CategoryWithChildrenResponse extends CategoryResponse {
  children: CategoryResponse[];
}

export interface ProductCreate {
  category_id: string;
  title: string;
  description?: string;
  images?: ProductImageCreate[];
  characteristics?: ProductCharacteristicCreate[];
}

export interface ProductResponse {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description?: string;
  status: ProductStatus;
  images: ProductImageResponse[];
  characteristics: ProductCharacteristicResponse[];
  skus: SKUShortResponse[];
  created_at: string;
  updated_at: string;
}

export interface ProductShortResponse {
  id: string;
  title: string;
  status: ProductStatus;
  category_id: string;
  created_at: string;
}

export interface ProductUpdate {
  category_id?: string;
  title?: string;
  description?: string;
  status?: ProductStatus;
}

export enum ProductStatus {
  CREATED = 'CREATED',
  ON_MODERATION = 'ON_MODERATION',
  MODERATED = 'MODERATED',
  BLOCKED = 'BLOCKED',
}

export interface ProductImageCreate {
  url: string;
  ordering?: number;
}

export interface ProductImageResponse {
  id: string;
  url: string;
  ordering: number;
}

export interface ProductImageUpdateRequest {
  url?: string;
  ordering?: number;
}

export interface ProductImageCreateRequest {
  url: string;
  ordering?: number;
}

export interface ProductCharacteristicCreate {
  name: string;
  value: string;
}

export interface ProductCharacteristicResponse {
  id: string;
  name: string;
  value: string;
}

export interface ProductListResponse {
  total: number;
  items: ProductShortResponse[];
}

export interface SKUCreate {
  product_id: string;
  name: string;
  price: number;
  stock_quantity?: number;
  article?: string;
  images?: SKUImageCreate[];
  characteristics?: SKUCharacteristicCreate[];
}

export interface SKUResponse {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock_quantity: number;
  article?: string;
  images: SKUImageResponse[];
  characteristics: SKUCharacteristicResponse[];
  created_at: string;
  updated_at: string;
}

export interface SKUShortResponse {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  article?: string;
}

export interface SKUUpdate {
  name?: string;
  price?: number;
  article?: string;
}

export interface SKUImageCreate {
  url: string;
  ordering?: number;
}

export interface SKUImageResponse {
  id: string;
  url: string;
  ordering: number;
}

export interface SKUImageUpdateRequest {
  url?: string;
  ordering?: number;
}

export interface SKUImageCreateRequest {
  url: string;
  ordering?: number;
}

export interface SKUCharacteristicCreate {
  name: string;
  value: string;
}

export interface SKUCharacteristicResponse {
  id: string;
  name: string;
  value: string;
}

export interface InvoiceCreate {
  items: InvoiceItemCreate[];
}

export interface InvoiceResponse {
  id: string;
  seller_id: string;
  status: InvoiceStatus;
  items: InvoiceItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  total: number;
  items: InvoiceResponse[];
}

export interface InvoiceItemCreate {
  sku_id: string;
  quantity: number;
}

export interface InvoiceItemResponse {
  id: string;
  sku_id: string;
  quantity: number;
}

export enum InvoiceStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
}

export interface UploadResponse {
  url: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
  ctx?: any;
}