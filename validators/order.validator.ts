//Order Validator
//Validates order data(shared between API and UI layers)

//Shared Infrastructure - Validators


import { z } from 'zod';
import { OrderModel } from '../api/clients/order.client';
import { createLogger } from '../core/logger';

const logger = createLogger('OrderValidator');

//Order schema validation using Zod
const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const shippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const orderSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  total: z.number().min(0),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: shippingAddressSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class OrderValidator {
  //Validate order object
  static validate(order: OrderModel): boolean {
    try {
      orderSchema.parse(order);
      logger.debug('Order validation passed', { orderId: order.id });
      return true;
    } catch (error) {
      logger.error('Order validation failed', error);
      throw error;
    }
  }

  //Validate order status
  static validateStatus(status: string): boolean {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const isValid = validStatuses.includes(status);

    if (!isValid) {
      logger.warn('Invalid order status', { status });
    }

    return isValid;
  }

  //Validate order total matches items
  static validateTotal(order: OrderModel): boolean {
    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const isValid = Math.abs(calculatedTotal - order.total) < 0.01;

    if (!isValid) {
      logger.error('Order total mismatch', {
        orderId: order.id,
        calculatedTotal,
        orderTotal: order.total,
      });
    }

    return isValid;
  }

  //Validate shipping address
  static validateShippingAddress(address: OrderModel['shippingAddress']): boolean {
    try {
      shippingAddressSchema.parse(address);
      logger.debug('Shipping address validation passed');
      return true;
    } catch (error) {
      logger.error('Shipping address validation failed', error);
      throw error;
    }
  }

  //Validate order items
  static validateItems(items: OrderModel['items']): boolean {
    if (items.length === 0) {
      logger.error('Order must have at least one item');
      return false;
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        logger.error('Item quantity must be greater than 0', { item });
        return false;
      }

      if (item.price < 0) {
        logger.error('Item price cannot be negative', { item });
        return false;
      }
    }

    logger.debug('Order items validation passed');
    return true;
  }

  //Validate order can be cancelled
  static canBeCancelled(order: OrderModel): boolean {
    const cancellableStatuses = ['pending', 'processing'];
    const canCancel = cancellableStatuses.includes(order.status);

    if (!canCancel) {
      logger.warn('Order cannot be cancelled', {
        orderId: order.id,
        status: order.status,
      });
    }

    return canCancel;
  }
}
