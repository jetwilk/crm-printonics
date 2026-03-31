"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const customer_use_cases_1 = require("./customer.use-cases");
exports.customerController = {
    async create(request, reply) {
        const body = request.body;
        const customer = await customer_use_cases_1.customerUseCases.createCustomer(body);
        return reply.status(201).send(customer);
    },
    async getById(request, reply) {
        const customer = await customer_use_cases_1.customerUseCases.getCustomerById(request.params.id);
        return reply.send(customer);
    },
    async list(_request, reply) {
        const customers = await customer_use_cases_1.customerUseCases.listCustomers();
        return reply.send(customers);
    },
};
