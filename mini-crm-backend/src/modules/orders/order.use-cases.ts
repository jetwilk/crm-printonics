import { orderRepository, CreateOrderDTO } from "./order.repository";
import { customerRepository } from "../customers/customer.repository";
import { eventRepository } from "../events/event.repository";
import { NotFoundError } from "../../shared/errors/AppError";
import { prisma } from "../../lib/prisma";

export const orderUseCases = {
  async createOrder(data: CreateOrderDTO) {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) throw new NotFoundError("Customer", data.customerId);

    const order = await orderRepository.create(data);

    await eventRepository.create({
      orderId: order.id,
      type: "ORDER_CREATED",
      mensagem: `Pedido "${order.titulo}" criado.`,
    });

    return order;
  },

  async getOrdersByCustomer(customerId: string) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw new NotFoundError("Customer", customerId);
    return orderRepository.findByCustomerWithTimeline(customerId);
  },

  // ← ADICIONAR ESTE MÉTODO
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
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
    if (!order) throw new NotFoundError("Order", id);
    return order;
  },
};
