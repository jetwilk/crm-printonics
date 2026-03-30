import type { OrderStatus } from "../../types";

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  ABERTO:           { label: "Aberto",           color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  PESQUISANDO:      { label: "Pesquisando",       color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  PROPOSTA_ENVIADA: { label: "Proposta Enviada",  color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  FECHADO:          { label: "Fechado",           color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  PERDIDO:          { label: "Perdido",           color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
