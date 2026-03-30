import { prisma } from "../../lib/prisma";

export type CreateCustomerDTO = {
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tags?: string[];
};

export const customerRepository = {
  async create(data: CreateCustomerDTO) {
    return prisma.customer.create({
      data: { ...data, tags: JSON.stringify(data.tags ?? []) },
    });
  },

  async findById(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  },

  async findAll() {
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          include: {
            orderMachines: {
              include: { machine: true },
            },
          },
        },
      },
    });
  },
};
