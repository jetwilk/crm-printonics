import { api } from "./axios";
import type { Order, OrderWithTimeline, CreateOrderPayload, OrderStatus } from "../types";

export const ordersApi = {
  getByCustomer: async (customerId: string): Promise<OrderWithTimeline[]> => {
    const { data } = await api.get(`/customers/${customerId}/orders`);
    return data;
  },

  getById: async (orderId: string): Promise<OrderWithTimeline> => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  changeStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await api.patch(`/orders/${orderId}/status`, { status });
  },
};
