import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../lib/prisma";

export const machineController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const machine = await prisma.machine.create({ data: body });
    return reply.status(201).send(machine);
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { arquivadas } = request.query as { arquivadas?: string };
    const machines = await prisma.machine.findMany({
      where: { arquivada: arquivadas === "true" },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(machines);
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const machine = await prisma.machine.findUnique({
      where: { id: request.params.id },
    });
    if (!machine) return reply.status(404).send({ message: "Máquina não encontrada." });
    return reply.send(machine);
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const body = request.body as any;
    const machine = await prisma.machine.update({
      where: { id: request.params.id },
      data: body,
    });
    return reply.send(machine);
  },

  async arquivar(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const machine = await prisma.machine.update({
      where: { id: request.params.id },
      data: { arquivada: true },
    });
    return reply.send(machine);
  },

  async desarquivar(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const machine = await prisma.machine.update({
      where: { id: request.params.id },
      data: { arquivada: false },
    });
    return reply.send(machine);
  },
};
