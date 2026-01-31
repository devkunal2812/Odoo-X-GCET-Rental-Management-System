/**
 * Product Service - API calls for product management
 */

import { api } from '@/app/lib/api-client';
import type { 
  Product, 
  ProductListResponse, 
  CreateProductRequest,
  ProductResponse 
} from '@/types/api';

export const productService = {
  /**
   * Get all products (public)
   */
  getAll: (params?: { 
    published?: boolean; 
    vendorId?: string;
    page?: number; 
    limit?: number;
  }) => api.get<ProductListResponse>('/products', params),

  /**
   * Get product by ID (public)
   */
  getById: (id: string) =>
    api.get<ProductResponse>(`/products/${id}`),

  /**
   * Create product (vendor only)
   */
  create: (data: CreateProductRequest) =>
    api.post<ProductResponse>('/vendor/products', data),

  /**
   * Update product (vendor only)
   */
  update: (id: string, data: Partial<CreateProductRequest>) =>
    api.put<ProductResponse>(`/vendor/products/${id}`, data),

  /**
   * Delete product (vendor only)
   */
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/vendor/products/${id}`),

  /**
   * Publish/unpublish product (admin only)
   */
  publish: (id: string, published: boolean) =>
    api.patch<ProductResponse>(`/admin/products/${id}/publish`, { published }),

  /**
   * Publish/unpublish product (vendor - own products)
   */
  togglePublish: (id: string, published: boolean) =>
    api.patch<ProductResponse>(`/vendor/products/${id}/publish`, { published }),
};
