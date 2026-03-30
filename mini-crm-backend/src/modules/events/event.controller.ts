import { FastifyRequest, FastifyReply } from "fastify";
import { eventUseCases } from "./event.use-cases";
import { OrderStatus } from "@prisma/client";

export const eventController = {
  async addNote(
    request: FastifyRequest<{ Params: { orderId: string }; Body: { mensagem: string } }>,
    reply: FastifyReply
  ) {
    const event = await eventUseCases.addNote(request.params.orderId, request.body.mensagem);
    return reply.status(201).send(event);
  },

  async changeStatus(
    request: FastifyRequest<{
      Params: { orderId: string };
      Body: { status: OrderStatus };
    }>,
    reply: FastifyReply
  ) {
    const result = await eventUseCases.changeStatus(request.params.orderId, request.body.status);
    return reply.send(result);
  },

  async linkMachine(
    request: FastifyRequest<{
      Params: { orderId: string };
      Body: { machineId: string; mensagem?: string };
    }>,
    reply: FastifyReply
  ) {
    const result = await eventUseCases.linkMachine(
      request.params.orderId,
      request.body.machineId,
      request.body.mensagem
    );
    return reply.status(201).send(result);
  },
};
