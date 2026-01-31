/**
 * Order Service - API calls for order management
 */

import { api } from '@/app/lib/api-client';
import type { 
  SaleOrder, 
  CreateOrderRequest, 
  OrderListResponse,
  OrderResponse 
} from '@/types/api';

export const orderService = {
  /**
   * Get all orders (authenticated)
   */
  getAll: (params?: { 
    status?: string; 
    page?: number;
    limit?: number;
  }) => api.get<OrderListResponse>('/orders', params),

  /**
   * Get order by ID (authenticated)
   */
  getById: (id: string) =>
    api.get<OrderResponse>(`/orders/${id}`),

  /**
   * Create order (customer only)
   */
  create: (data: CreateOrderRequest) =>
    api.post<OrderResponse>('/orders', data),

  /**
   * Send order to customer (vendor only)
   */
  send: (id: string) =>
    api.post<OrderResponse>(`/orders/${id}/send`),

  /**
   * Confirm order (vendor only)
   */
  confirm: (id: string) =>
    api.post<OrderResponse>(`/orders/${id}/confirm`),

  /**
   * Mark order as picked up (vendor/admin only)
   */
  pickup: (id: string) =>
    api.post<OrderResponse>(`/orders/${id}/pickup`),

  /**
   * Process return (vendor/admin only)
   */
  return: (id: string, returnDate?: string) =>
    api.post<OrderResponse>(`/orders/${id}/return`, { returnDate }),
};
