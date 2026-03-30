"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepository = void 0;
const prisma_1 = require("../../lib/prisma");
exports.customerRepository = {
    async create(data) {
        return prisma_1.prisma.customer.create({
            data: { ...data, tags: JSON.stringify(data.tags ?? []) },
        });
    },
    async findById(id) {
        return prisma_1.prisma.customer.findUnique({ where: { id } });
    },
    async findAll() {
        return prisma_1.prisma.customer.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                orders: {
                    include: {
                        orderMachines: {
                            include: { machine: true },
                        },
                    },
                },
            },
        });
    },
};
