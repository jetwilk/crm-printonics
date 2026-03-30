import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ordersApi } from "../../api/orders";
import { StatusBadge } from "../ui/Badge";
import type { OrderStatus } from "../../types";

const ALL_STATUSES: OrderStatus[] = [
  "ABERTO",
  "PESQUISANDO",
  "PROPOSTA_ENVIADA",
  "FECHADO",
  "PERDIDO",
];

const statusLabel: Record<OrderStatus, string> = {
  ABERTO:           "Aberto",
  PESQUISANDO:      "Pesquisando",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  FECHADO:          "Fechado",
  PERDIDO:          "Perdido",
};

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusSelector({ orderId, currentStatus }: Props) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      ordersApi.changeStatus(orderId, newStatus),
    onSuccess: (_data, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      toast.success(`Status alterado para "${statusLabel[newStatus]}" ✅`);
      setIsOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="relative">
      {/* Badge clicável */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        title="Clica para mudar o status"
        disabled={mutation.isPending}
      >
        <StatusBadge status={currentStatus} />
        <span className="ml-1 text-xs text-gray-400">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                disabled={status === currentStatus || mutation.isPending}
                onClick={() => mutation.mutate(status)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors
                  ${status === currentStatus
                    ? "bg-gray-50 dark:bg-gray-700 cursor-default opacity-60"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  }`}
              >
                <StatusBadge status={status} />
                {status === currentStatus && (
                  <span className="ml-auto text-xs text-gray-400">atual</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {mutation.isPending && (
        <span className="ml-2 text-xs text-gray-400 animate-pulse">
          A guardar...
        </span>
      )}
    </div>
  );
}
