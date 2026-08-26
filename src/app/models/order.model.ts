export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string;
  phoneNumber?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export const ORDER_STATUS_LABELS = {
  [OrderStatus.PENDIENTE]: 'Pendiente',
  [OrderStatus.COMPLETADO]: 'Completado',
  [OrderStatus.CANCELADO]: 'Cancelado'
};

export const ORDER_STATUS_COLORS = {
  [OrderStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [OrderStatus.COMPLETADO]: 'bg-green-100 text-green-800 border-green-300',
  [OrderStatus.CANCELADO]: 'bg-red-100 text-red-800 border-red-300'
};
