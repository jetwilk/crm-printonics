"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderUseCases = void 0;
const order_repository_1 = require("./order.repository");
const customer_repository_1 = require("../customers/customer.repository");
const event_repository_1 = require("../events/event.repository");
const AppError_1 = require("../../shared/errors/AppError");
const prisma_1 = require("../../lib/prisma");
exports.orderUseCases = {
    async createOrder(data) {
        const customer = await customer_repository_1.customerRepository.findById(data.customerId);
        if (!customer)
            throw new AppError_1.NotFoundError("Customer", data.customerId);
        const order = await order_repository_1.orderRepository.create(data);
        await event_repository_1.eventRepository.create({
            orderId: order.id,
            type: "ORDER_CREATED",
            mensagem: `Pedido "${order.titulo}" criado.`,
        });
        return order;
    },
    async getOrdersByCustomer(customerId) {
        const customer = await customer_repository_1.customerRepository.findById(customerId);
        if (!customer)
            throw new AppError_1.NotFoundError("Customer", customerId);
        return order_repository_1.orderRepository.findByCustomerWithTimeline(customerId);
    },
    // ← ADICIONAR ESTE MÉTODO
    async getOrderById(id) {
        const order = await prisma_1.prisma.order.findUnique({
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
        if (!order)
            throw new AppError_1.NotFoundError("Order", id);
        return order;
    },
};
