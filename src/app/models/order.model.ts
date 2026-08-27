// src/app/models/order.model.ts
export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  shippingAddress?: string;
  paymentMethod?: string;
  phoneNumber?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  subtotal?: number;
  imageUrl?: string;
  notes?: string;
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDIENTE]: '📋 Pendiente',
  [OrderStatus.EN_PROCESO]: '🔄 En Proceso',
  [OrderStatus.COMPLETADO]: '✅ Completado',
  [OrderStatus.CANCELADO]: '❌ Cancelado'
};

export const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.PENDIENTE, label: '📋 Pendiente' },
  { value: OrderStatus.EN_PROCESO, label: '🔄 En Proceso' },
  { value: OrderStatus.COMPLETADO, label: '✅ Completado' },
  { value: OrderStatus.CANCELADO, label: '❌ Cancelado' }
];

export const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDIENTE]: 'pending',
  [OrderStatus.EN_PROCESO]: 'progress',
  [OrderStatus.COMPLETADO]: 'completed',
  [OrderStatus.CANCELADO]: 'cancelled'
};