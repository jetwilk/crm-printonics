import { FastifyRequest, FastifyReply } from "fastify";
import { customerUseCases } from "./customer.use-cases";

export const customerController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      nome: string;
      email?: string;
      telefone?: string;
      empresa?: string;
      tags?: string[];
    };
    const customer = await customerUseCases.createCustomer(body);
    return reply.status(201).send(customer);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await customerUseCases.getCustomerById(request.params.id);
    return reply.send(customer);
  },

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const customers = await customerUseCases.listCustomers();
    return reply.send(customers);
  },
};
