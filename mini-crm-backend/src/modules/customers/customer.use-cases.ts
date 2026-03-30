import { customerRepository, CreateCustomerDTO } from "./customer.repository";
import { NotFoundError } from "../../shared/errors/AppError";

export const customerUseCases = {
  async createCustomer(data: CreateCustomerDTO) {
    // Regra de negócio: e-mail único se fornecido
    if (data.email) {
      const existing = await prisma.customer.findFirst({
        where: { email: data.email },
      });
      if (existing) {
        throw new AppError("Já existe um cliente com esse e-mail.", 409, "DUPLICATE_EMAIL");
      }
    }
    return customerRepository.create(data);
  },

  async getCustomerById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError("Customer", id);
    return customer;
  },

  async listCustomers() {
    return customerRepository.findAll();
  },
};

// imports que faltaram no topo — adicione:
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/AppError";
