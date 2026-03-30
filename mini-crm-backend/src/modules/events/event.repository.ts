import { prisma } from "../../lib/prisma";
import { OrderEventType, OrderStatus } from "@prisma/client";

export type CreateEventDTO = {
  orderId: string;
  type: OrderEventType;
  orderMachineId?: string;
  oldStatus?: OrderStatus;
  newStatus?: OrderStatus;
  mensagem?: string;
};

export const eventRepository = {
  async create(data: CreateEventDTO) {
    return prisma.orderEvent.create({
      data: {
        orderId:        data.orderId,
        type:           data.type,
        mensagem:       data.mensagem,
        orderMachineId: data.orderMachineId,
        oldStatus:      data.oldStatus,
        newStatus:      data.newStatus,
      },
    });
  },
};
