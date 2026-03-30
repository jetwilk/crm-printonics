import { api } from "./axios";
import type { Machine } from "../types";

export const machinesApi = {
  list: async (arquivadas = false): Promise<Machine[]> => {
    const { data } = await api.get(`/machines?arquivadas=${arquivadas}`);
    return data;
  },

  getById: async (id: string): Promise<Machine> => {
    const { data } = await api.get(`/machines/${id}`);
    return data;
  },

  update: async (id: string, payload: Partial<Machine>): Promise<Machine> => {
    const { data } = await api.patch(`/machines/${id}`, payload);
    return data;
  },

  arquivar: async (id: string): Promise<void> => {
    await api.patch(`/machines/${id}/arquivar`);
  },

  desarquivar: async (id: string): Promise<void> => {
    await api.patch(`/machines/${id}/desarquivar`);
  },
};
