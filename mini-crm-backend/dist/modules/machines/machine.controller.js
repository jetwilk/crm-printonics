"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.machineController = void 0;
const prisma_1 = require("../../lib/prisma");
exports.machineController = {
    async create(request, reply) {
        const body = request.body;
        const machine = await prisma_1.prisma.machine.create({ data: body });
        return reply.status(201).send(machine);
    },
    async list(request, reply) {
        const { arquivadas } = request.query;
        const machines = await prisma_1.prisma.machine.findMany({
            where: { arquivada: arquivadas === "true" },
            orderBy: { createdAt: "desc" },
        });
        return reply.send(machines);
    },
    async getById(request, reply) {
        const machine = await prisma_1.prisma.machine.findUnique({
            where: { id: request.params.id },
        });
        if (!machine)
            return reply.status(404).send({ message: "Máquina não encontrada." });
        return reply.send(machine);
    },
    async update(request, reply) {
        const body = request.body;
        const machine = await prisma_1.prisma.machine.update({
            where: { id: request.params.id },
            data: body,
        });
        return reply.send(machine);
    },
    async arquivar(request, reply) {
        const machine = await prisma_1.prisma.machine.update({
            where: { id: request.params.id },
            data: { arquivada: true },
        });
        return reply.send(machine);
    },
    async desarquivar(request, reply) {
        const machine = await prisma_1.prisma.machine.update({
            where: { id: request.params.id },
            data: { arquivada: false },
        });
        return reply.send(machine);
    },
};
