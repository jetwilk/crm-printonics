import { api } from "./axios";
import type { OrderEvent, CreateMachinePayload } from "../types";

export const eventsApi = {
  addNote: async (orderId: string, mensagem: string): Promise<OrderEvent> => {
    const { data } = await api.post(`/orders/${orderId}/events/note`, { mensagem });
    return data;
  },

  linkMachine: async (
    orderId: string,
    payload: CreateMachinePayload & { mensagem?: string; machineId?: string }
  ): Promise<{ orderMachine: unknown; event: OrderEvent }> => {
    if (!payload.machineId) {
      const { fabricante, modelo, ano, formato, cores, pais, precoPedido, moeda, fonte, urlAnuncio, notasTecnicas } = payload;
      const { data: machine } = await api.post("/machines", {
        fabricante, modelo, ano, formato, cores, pais, precoPedido, moeda, fonte, urlAnuncio, notasTecnicas,
      });
      const { data } = await api.post(`/orders/${orderId}/machines`, {
        machineId: machine.id,
        mensagem: payload.mensagem,
      });
      return data;
    }
    const { data } = await api.post(`/orders/${orderId}/machines`, {
      machineId: payload.machineId,
      mensagem: payload.mensagem,
    });
    return data;
  },
};
