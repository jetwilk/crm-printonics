import { prisma } from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export type CreateOrderDTO = {
  customerId: string;
  titulo: string;
  descricao?: string;
  orcamentoMaximo?: number;
  moeda?: string;
  prazoDesejado?: string;
  origemLead?: string;
};

export const orderRepository = {
  async create(data: CreateOrderDTO) {
    const { orcamentoMaximo, prazoDesejado, ...rest } = data;
    return prisma.order.create({
      data: {
        ...rest,
        orcamentoMaximo: orcamentoMaximo != null ? new Decimal(orcamentoMaximo) : undefined,
        prazoDesejado: prazoDesejado ? new Date(prazoDesejado) : undefined,
      },
    });
  },

  async findByCustomerWithTimeline(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
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
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id } });
  },
};
