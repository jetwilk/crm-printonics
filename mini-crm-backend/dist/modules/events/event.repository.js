"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRepository = void 0;
const prisma_1 = require("../../lib/prisma");
exports.eventRepository = {
    async create(data) {
        return prisma_1.prisma.orderEvent.create({
            data: {
                orderId: data.orderId,
                type: data.type,
                mensagem: data.mensagem,
                orderMachineId: data.orderMachineId,
                oldStatus: data.oldStatus,
                newStatus: data.newStatus,
            },
        });
    },
};
