import { FastifyRequest, FastifyReply } from "fastify";
import { orderUseCases } from "./order.use-cases";

export const orderController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const order = await orderUseCases.createOrder(body);
    return reply.status(201).send(order);
  },

  async listByCustomer(
    request: FastifyRequest<{ Params: { customerId: string } }>,
    reply: FastifyReply
  ) {
    const orders = await orderUseCases.getOrdersByCustomer(request.params.customerId);
    return reply.send(orders);
  },

  // ← ADICIONAR ESTE MÉTODO
  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const order = await orderUseCases.getOrderById(request.params.id);
    return reply.send(order);
  },
};
