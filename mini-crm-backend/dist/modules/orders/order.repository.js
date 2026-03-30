"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = void 0;
const prisma_1 = require("../../lib/prisma");
const library_1 = require("@prisma/client/runtime/library");
exports.orderRepository = {
    async create(data) {
        const { orcamentoMaximo, prazoDesejado, ...rest } = data;
        return prisma_1.prisma.order.create({
            data: {
                ...rest,
                orcamentoMaximo: orcamentoMaximo != null ? new library_1.Decimal(orcamentoMaximo) : undefined,
                prazoDesejado: prazoDesejado ? new Date(prazoDesejado) : undefined,
            },
        });
    },
    async findByCustomerWithTimeline(customerId) {
        return prisma_1.prisma.order.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" },
            include: {
                events: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        orderMachine: {
                            include: { machine: true },
                        },
                    },
                },
                orderMachines: {
                    include: { machine: true },
                },
            },
        });
    },
    async findById(id) {
        return prisma_1.prisma.order.findUnique({ where: { id } });
    },
};
