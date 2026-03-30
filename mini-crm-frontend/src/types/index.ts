export type OrderStatus =
  | "ABERTO"
  | "PESQUISANDO"
  | "PROPOSTA_ENVIADA"
  | "FECHADO"
  | "PERDIDO";

export type OrderEventType =
  | "ORDER_CREATED"
  | "MACHINE_LINKED"
  | "MACHINE_REMOVED"
  | "NOTE"
  | "STATUS_CHANGED";

export interface CustomerListItem extends Customer {
  orders: Array<{
    id: string;
    titulo: string;
    status: OrderStatus;
    orderMachines: Array<{
      machine: {
        fabricante: string;
        modelo: string;
        ano?: number;
      };
    }>;
  }>;
}

export type OrderMachineStatus =
  | "CANDIDATA"
  | "PROPOSTA_ENVIADA"
  | "DESCARTADA"
  | "SELECIONADA";

export interface Customer {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  titulo: string;
  descricao?: string;
  status: OrderStatus;
  orcamentoMaximo?: number;
  moeda: string;
  prazoDesejado?: string;
  origemLead?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  fabricante: string;
  modelo: string;
  ano?: number;
  formato?: string;
  cores?: number;
  pais?: string;
  precoPedido?: number;
  moeda: string;
  fonte?: string;
  urlAnuncio?: string;
  notasTecnicas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderMachine {
  id: string;
  orderId: string;
  machineId: string;
  status: OrderMachineStatus;
  machine: Machine;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: OrderEventType;
  orderMachineId?: string;
  oldStatus?: OrderStatus;
  newStatus?: OrderStatus;
  mensagem?: string;
  createdAt: string;
  orderMachine?: OrderMachine;
}

export interface OrderWithTimeline extends Order {
  events: OrderEvent[];
  orderMachines: OrderMachine[];
}

export interface CreateCustomerPayload {
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  tags?: string[];
}

export interface CreateOrderPayload {
  customerId: string;
  titulo: string;
  descricao?: string;
  orcamentoMaximo?: number;
  moeda?: string;
  prazoDesejado?: string;
  origemLead?: string;
}

export interface CreateMachinePayload {
  fabricante: string;
  modelo: string;
  ano?: number;
  formato?: string;
  cores?: number;
  pais?: string;
  precoPedido?: number;
  moeda?: string;
  fonte?: string;
  urlAnuncio?: string;
  notasTecnicas?: string;
}
