import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { machinesApi } from "../api/machines";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders";
import { eventsApi } from "../api/events";
import { StatusSelector } from "../components/orders/StatusSelector";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import type { OrderEventType, CreateMachinePayload, OrderMachine, OrderEvent } from "../types";

const eventTypeLabel: Record<OrderEventType, string> = {
  ORDER_CREATED:   "📋 Pedido criado",
  MACHINE_LINKED:  "🔗 Máquina associada",
  MACHINE_REMOVED: "❌ Máquina removida",
  NOTE:            "📝 Nota",
  STATUS_CHANGED:  "🔄 Status alterado",
};

function ExistingMachineSelector({
  orderId,
  alreadyLinked,
  onSuccess,
}: {
  orderId: string;
  alreadyLinked: string[];
  onSuccess: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: machines = [], isLoading } = useQuery({
    queryKey: ["machines"],
    queryFn: machinesApi.list,
  });

  const mutation = useMutation({
    mutationFn: () =>
      eventsApi.linkMachine(orderId, { machineId: selectedId! }),
    onSuccess: () => {
      toast.success("Máquina associada ao pedido! 🖨️");
      onSuccess();
      setSelectedId(null);
      setSearch("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = machines.filter(
    (m) =>
      !alreadyLinked.includes(m.id) &&
      (`${m.fabricante} ${m.modelo}`.toLowerCase().includes(search.toLowerCase()) ||
        (m.pais ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <input
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Buscar máquina por fabricante, modelo ou país..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4 text-center">A carregar...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          {machines.length === 0
            ? "Nenhuma máquina cadastrada ainda."
            : "Todas as máquinas já estão associadas a este pedido."}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {filtered.map((machine) => (
            <div
              key={machine.id}
              onClick={() => setSelectedId(machine.id)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                selectedId === machine.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div>
                <p className="font-medium text-sm">
                  {machine.fabricante} {machine.modelo}
                  {machine.ano && (
                    <span className="ml-2 text-xs text-gray-400">({machine.ano})</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {[machine.pais, machine.formato, machine.cores ? `${machine.cores} cores` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {machine.precoPedido != null && (
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {Number(machine.precoPedido).toLocaleString("pt-PT")} {machine.moeda}
                  </span>
                )}
                {selectedId === machine.id && (
                  <span className="text-blue-500 text-lg">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        disabled={!selectedId || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {mutation.isPending ? "A associar..." : "Associar máquina selecionada"}
      </button>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [machineForm, setMachineForm] = useState<Partial<CreateMachinePayload>>({ moeda: "EUR" });

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  const addNoteMutation = useMutation({
    mutationFn: (mensagem: string) => eventsApi.addNote(orderId!, mensagem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setNote("");
    },
  });

  const [machineMode, setMachineMode] = useState<"existing" | "new">("existing");

  const createOrderMutation = useMutation({
  mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
  onSuccess: () => {
    toast.success("Pedido criado com sucesso! ✅");
    queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
    setShowForm(false);
    setForm({ moeda: "EUR", origemLead: "WhatsApp" });
  },
  onError: (err: Error) => {
    toast.error(err.message);
  },
});

  const linkMachineMutation = useMutation({
    mutationFn: (payload: CreateMachinePayload) => eventsApi.linkMachine(orderId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setShowMachineForm(false);
      setMachineForm({ moeda: "EUR" });
    },
  });

  if (isLoading) return <Spinner />;
  if (!order) return <p className="text-red-500 text-center py-8">Pedido não encontrado.</p>;

  const machineFields: Array<{ label: string; key: keyof CreateMachinePayload; placeholder: string; type?: string }> = [
    { label: "Fabricante *", key: "fabricante", placeholder: "Heidelberg" },
    { label: "Modelo *",     key: "modelo",     placeholder: "SM52-4" },
    { label: "Ano",          key: "ano",        placeholder: "2007",   type: "number" },
    { label: "País",         key: "pais",       placeholder: "Alemanha" },
    { label: "Preço (€)",    key: "precoPedido",placeholder: "35000",  type: "number" },
    { label: "URL do anúncio", key: "urlAnuncio", placeholder: "https://..." },
  ];

  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/customers" className="hover:text-blue-600 dark:hover:text-blue-400">Clientes</Link>
        <span className="mx-2">/</span>
        <span className="truncate">{order.titulo}</span>
      </div>

      {/* Cabeçalho */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold">{order.titulo}</h1>
          <StatusSelector orderId={order.id} currentStatus={order.status} />
        </div>
        {order.descricao && <p className="text-gray-600 dark:text-gray-300 mb-3">{order.descricao}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          {order.orcamentoMaximo != null && (
            <span>💰 {Number(order.orcamentoMaximo).toLocaleString("pt-PT")} {order.moeda}</span>
          )}
          {order.prazoDesejado && (
            <span>📅 {new Date(order.prazoDesejado).toLocaleDateString("pt-PT")}</span>
          )}
          {order.origemLead && <span>📌 {order.origemLead}</span>}
        </div>
      </div>

      {/* Máquinas candidatas */}
      {order.orderMachines?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">🖨️ Máquinas Candidatas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {order.orderMachines.map((om: OrderMachine) => (
              <div key={om.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                <p className="font-semibold">{om.machine.fabricante} {om.machine.modelo}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                  {om.machine.ano && <p>Ano: {om.machine.ano}</p>}
                  {om.machine.pais && <p>País: {om.machine.pais}</p>}
                  {om.machine.precoPedido != null && (
                    <p>Preço: {Number(om.machine.precoPedido).toLocaleString("pt-PT")} {om.machine.moeda}</p>
                  )}
                  {om.machine.urlAnuncio && (
                    <a
                      href={om.machine.urlAnuncio}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver anúncio ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">📅 Timeline</h2>
        {order.events?.length === 0 ? (
          <EmptyState message="Nenhum evento ainda." />
        ) : (
          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-6">
            {order.events?.map((event: OrderEvent) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{eventTypeLabel[event.type]}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.createdAt).toLocaleString("pt-PT")}
                    </span>
                  </div>
                  {event.mensagem && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.mensagem}</p>
                  )}
                  {event.type === "STATUS_CHANGED" && event.oldStatus && event.newStatus && (
                    <p className="text-xs text-gray-400 mt-1">
                      {event.oldStatus} → {event.newStatus}
                    </p>
                  )}
                  {event.type === "MACHINE_LINKED" && event.orderMachine && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      {event.orderMachine.machine.fabricante} {event.orderMachine.machine.modelo}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adicionar nota */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4 shadow-sm">
        <h3 className="font-semibold mb-3">📝 Adicionar Nota</h3>
        <textarea
          rows={2}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escreve uma nota sobre este pedido..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {addNoteMutation.error && (
          <p className="text-red-500 text-sm mb-2">{(addNoteMutation.error as Error).message}</p>
        )}
        <button
          disabled={!note.trim() || addNoteMutation.isPending}
          onClick={() => addNoteMutation.mutate(note.trim())}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {addNoteMutation.isPending ? "A guardar..." : "Guardar nota"}
        </button>
      </div>

      {/* Associar máquina */}
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold">🖨️ Associar Nova Máquina</h3>
    <button
      onClick={() => setShowMachineForm((v) => !v)}
      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
    >
      {showMachineForm ? "Cancelar" : "+ Adicionar"}
    </button>
  </div>

  {showMachineForm && (
    <div>
      {/* Toggle entre máquina existente e nova */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMachineMode("existing")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            machineMode === "existing"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Escolher existente
        </button>
        <button
          onClick={() => setMachineMode("new")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            machineMode === "new"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Criar nova
        </button>
      </div>

      {/* MODO: escolher existente */}
      {machineMode === "existing" && (
        <ExistingMachineSelector
          orderId={orderId!}
          alreadyLinked={order.orderMachines.map((om) => om.machineId)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["order", orderId] })}
        />
      )}

      {/* MODO: criar nova */}
      {machineMode === "new" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machineFields.map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type={type ?? "text"}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
                value={(machineForm as Record<string, string | number>)[key] ?? ""}
                onChange={(e) =>
                  setMachineForm({
                    ...machineForm,
                    [key]: type === "number" ? Number(e.target.value) || undefined : e.target.value,
                  })
                }
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notas técnicas</label>
            <textarea
              rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Estado, contador de impressões, revisões..."
              value={machineForm.notasTecnicas ?? ""}
              onChange={(e) => setMachineForm({ ...machineForm, notasTecnicas: e.target.value })}
            />
          </div>
          {linkMachineMutation.error && (
            <p className="text-red-500 text-sm md:col-span-2">
              {(linkMachineMutation.error as Error).message}
            </p>
          )}
          <div className="md:col-span-2">
            <button
              disabled={!machineForm.fabricante || !machineForm.modelo || linkMachineMutation.isPending}
              onClick={() => linkMachineMutation.mutate(machineForm as CreateMachinePayload)}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {linkMachineMutation.isPending ? "A associar..." : "Associar ao pedido"}
            </button>
          </div>
        </div>
      )}
    </div>
  )}
</div>
    </div>
  );
}
