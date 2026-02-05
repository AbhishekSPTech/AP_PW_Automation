/**
 * Order API Client
 * Handles order operations
 * 
 * API Layer - Data Control
 */

import { APIRequestContext } from '@playwright/test';
import { BaseAPIClient } from '../base.client';
import { createLogger } from '../../core/logger';

const logger = createLogger('OrderAPIClient');

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface OrderModel {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class OrderClient extends BaseAPIClient {
  private authToken?: string;

  constructor(request: APIRequestContext, authToken?: string) {
    super(request);
    this.authToken = authToken;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private getAuthHeaders(): Record<string, string> {
    return this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : {};
  }

  /**
   * Create order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderModel> {
    logger.info('Creating order', { userId: orderData.userId });

    const response = await this.post('/orders', {
      headers: this.getAuthHeaders(),
      data: orderData,
      retry: true,
    });

    this.verifyStatus(response, 201);
    const data = await this.parseJSON<OrderModel>(response);

    logger.info('Order created successfully', { orderId: data.id });
    return data;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderModel> {
    logger.info('Fetching order', { orderId });

    const response = await this.get(`/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
      retry: true,
    });

    this.verifyStatus(response, 200);
    return await this.parseJSON<OrderModel>(response);
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUserId(userId: string): Promise<OrderModel[]> {
    logger.info('Fetching orders for user', { userId });

    const response = await this.get('/orders', {
      headers: this.getAuthHeaders(),
      params: { userId },
      retry: true,
    });

    this.verifyStatus(response, 200);
    return await this.parseJSON<OrderModel[]>(response);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderModel['status']
  ): Promise<OrderModel> {
    logger.info('Updating order status', { orderId, status });

    const response = await this.patch(`/orders/${orderId}/status`, {
      headers: this.getAuthHeaders(),
      data: { status },
    });

    this.verifyStatus(response, 200);
    const data = await this.parseJSON<OrderModel>(response);

    logger.info('Order status updated', { orderId, status });
    return data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<OrderModel> {
    logger.info('Cancelling order', { orderId });

    const response = await this.patch(`/orders/${orderId}/cancel`, {
      headers: this.getAuthHeaders(),
    });

    this.verifyStatus(response, 200);
    const data = await this.parseJSON<OrderModel>(response);

    logger.info('Order cancelled', { orderId });
    return data;
  }

  /**
   * Delete order
   */
  async deleteOrder(orderId: string): Promise<void> {
    logger.info('Deleting order', { orderId });

    const response = await this.delete(`/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });

    this.verifyStatus(response, 204);
    logger.info('Order deleted successfully', { orderId });
  }
}
