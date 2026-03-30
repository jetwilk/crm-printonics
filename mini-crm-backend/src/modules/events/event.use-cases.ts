import { prisma } from "../../lib/prisma";
import { eventRepository } from "./event.repository";
import { orderRepository } from "../orders/order.repository";
import { AppError, NotFoundError } from "../../shared/errors/AppError";
import { OrderStatus } from "@prisma/client";

export const eventUseCases = {
  // Adicionar nota livre
  async addNote(orderId: string, mensagem: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    return eventRepository.create({ orderId, type: "NOTE", mensagem });
  },

  // Mudar status do pedido
  async changeStatus(orderId: string, newStatus: OrderStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    if (order.status === newStatus) {
      throw new AppError("O pedido já está nesse status.", 400, "SAME_STATUS");
    }

    const [updatedOrder, event] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      }),
      prisma.orderEvent.create({
        data: {
          orderId,
          type: "STATUS_CHANGED",
          oldStatus: order.status,
          newStatus,
          mensagem: `Status alterado de ${order.status} para ${newStatus}.`,
        },
      }),
    ]);

    return { order: updatedOrder, event };
  },

  // Associar máquina a um pedido (cria OrderMachine + evento MACHINE_LINKED)
  async linkMachine(orderId: string, machineId: string, mensagem?: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order", orderId);

    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new NotFoundError("Machine", machineId);

    // Verifica se já está associada
    const existing = await prisma.orderMachine.findUnique({
      where: { orderId_machineId: { orderId, machineId } },
    });
    if (existing) {
      throw new AppError("Máquina já está associada a este pedido.", 409, "ALREADY_LINKED");
    }

    const [orderMachine, event] = await prisma.$transaction(async (tx) => {
      const om = await tx.orderMachine.create({
        data: { orderId, machineId },
        include: { machine: true },
      });

      const ev = await tx.orderEvent.create({
        data: {
          orderId,
          type: "MACHINE_LINKED",
          orderMachineId: om.id,
          mensagem:
            mensagem ??
            `Máquina ${machine.fabricante} ${machine.modelo} (${machine.ano ?? "s/d"}) associada ao pedido.`,
        },
      });

      return [om, ev];
    });

    return { orderMachine, event };
  },
};
