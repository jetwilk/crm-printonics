import { api } from "./axios";
import type { Customer, CreateCustomerPayload } from "../types";

export const customersApi = {
  list: async (): Promise<Customer[]> => {
    const { data } = await api.get("/customers");
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (payload: CreateCustomerPayload): Promise<Customer> => {
    const { data } = await api.post("/customers", payload);
    return data;
  },
};
