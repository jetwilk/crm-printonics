"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerUseCases = void 0;
const customer_repository_1 = require("./customer.repository");
const AppError_1 = require("../../shared/errors/AppError");
exports.customerUseCases = {
    async createCustomer(data) {
        // Regra de negócio: e-mail único se fornecido
        if (data.email) {
            const existing = await prisma_1.prisma.customer.findFirst({
                where: { email: data.email },
            });
            if (existing) {
                throw new AppError_2.AppError("Já existe um cliente com esse e-mail.", 409, "DUPLICATE_EMAIL");
            }
        }
        return customer_repository_1.customerRepository.create(data);
    },
    async getCustomerById(id) {
        const customer = await customer_repository_1.customerRepository.findById(id);
        if (!customer)
            throw new AppError_1.NotFoundError("Customer", id);
        return customer;
    },
    async listCustomers() {
        return customer_repository_1.customerRepository.findAll();
    },
};
// imports que faltaram no topo — adicione:
const prisma_1 = require("../../lib/prisma");
const AppError_2 = require("../../shared/errors/AppError");
