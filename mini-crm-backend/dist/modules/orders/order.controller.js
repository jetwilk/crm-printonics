"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const order_use_cases_1 = require("./order.use-cases");
exports.orderController = {
    async create(request, reply) {
        const body = request.body;
        const order = await order_use_cases_1.orderUseCases.createOrder(body);
        return reply.status(201).send(order);
    },
    async listByCustomer(request, reply) {
        const orders = await order_use_cases_1.orderUseCases.getOrdersByCustomer(request.params.customerId);
        return reply.send(orders);
    },
    // ← ADICIONAR ESTE MÉTODO
    async getById(request, reply) {
        const order = await order_use_cases_1.orderUseCases.getOrderById(request.params.id);
        return reply.send(order);
    },
};
