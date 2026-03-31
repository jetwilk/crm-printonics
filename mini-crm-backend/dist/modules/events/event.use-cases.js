"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventUseCases = void 0;
const prisma_1 = require("../../lib/prisma");
const event_repository_1 = require("./event.repository");
const order_repository_1 = require("../orders/order.repository");
const AppError_1 = require("../../shared/errors/AppError");
exports.eventUseCases = {
    // Adicionar nota livre
    async addNote(orderId, mensagem) {
        const order = await order_repository_1.orderRepository.findById(orderId);
        if (!order)
            throw new AppError_1.NotFoundError("Order", orderId);
        return event_repository_1.eventRepository.create({ orderId, type: "NOTE", mensagem });
    },
    // Mudar status do pedido
    async changeStatus(orderId, newStatus) {
        const order = await order_repository_1.orderRepository.findById(orderId);
        if (!order)
            throw new AppError_1.NotFoundError("Order", orderId);
        if (order.status === newStatus) {
            throw new AppError_1.AppError("O pedido já está nesse status.", 400, "SAME_STATUS");
        }
        const [updatedOrder, event] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.order.update({
                where: { id: orderId },
                data: { status: newStatus },
            }),
            prisma_1.prisma.orderEvent.create({
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
    async linkMachine(orderId, machineId, mensagem) {
        const order = await order_repository_1.orderRepository.findById(orderId);
        if (!order)
            throw new AppError_1.NotFoundError("Order", orderId);
        const machine = await prisma_1.prisma.machine.findUnique({ where: { id: machineId } });
        if (!machine)
            throw new AppError_1.NotFoundError("Machine", machineId);
        // Verifica se já está associada
        const existing = await prisma_1.prisma.orderMachine.findUnique({
            where: { orderId_machineId: { orderId, machineId } },
        });
        if (existing) {
            throw new AppError_1.AppError("Máquina já está associada a este pedido.", 409, "ALREADY_LINKED");
        }
        const [orderMachine, event] = await prisma_1.prisma.$transaction(async (tx) => {
            const om = await tx.orderMachine.create({
                data: { orderId, machineId },
                include: { machine: true },
            });
            const ev = await tx.orderEvent.create({
                data: {
                    orderId,
                    type: "MACHINE_LINKED",
                    orderMachineId: om.id,
                    mensagem: mensagem ??
                        `Máquina ${machine.fabricante} ${machine.modelo} (${machine.ano ?? "s/d"}) associada ao pedido.`,
                },
            });
            return [om, ev];
        });
        return { orderMachine, event };
    },
};
