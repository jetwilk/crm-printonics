import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { customersApi } from "../api/customers";
import { ordersApi } from "../api/orders";
import { StatusBadge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import type { CreateOrderPayload } from "../types";

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CreateOrderPayload>>({ moeda: "EUR", origemLead: "WhatsApp" });

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => customersApi.getById(customerId!),
    enabled: !!customerId,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => ordersApi.getByCustomer(customerId!),
    enabled: !!customerId,
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
      setShowForm(false);
      setForm({ moeda: "EUR", origemLead: "WhatsApp" });
    },
  });
  const linkMachineMutation = useMutation({
  mutationFn: (payload: CreateMachinePayload) => eventsApi.linkMachine(orderId!, payload),
  onSuccess: () => {
    toast.success("Máquina associada ao pedido! 🖨️");
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    setShowMachineForm(false);
    setMachineForm({ moeda: "EUR" });
  },
  onError: (err: Error) => {
    toast.error(err.message);
  },
});
  const addNoteMutation = useMutation({
  mutationFn: (mensagem: string) => eventsApi.addNote(orderId!, mensagem),
  onSuccess: () => {
    toast.success("Nota adicionada! 📝");
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    setNote("");
  },
  onError: (err: Error) => {
    toast.error(err.message);
  },
});

  if (loadingCustomer) return <Spinner />;
  if (!customer) return <p className="text-red-500 text-center py-8">Cliente não encontrado.</p>;

  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/customers" className="hover:text-blue-600 dark:hover:text-blue-400">Clientes</Link>
        <span className="mx-2">/</span>
        <span>{customer.nome}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">{customer.nome}</h1>
        {customer.empresa && <p className="text-gray-500 dark:text-gray-400 text-sm">{customer.empresa}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-300">
          {customer.email && <span>📧 {customer.email}</span>}
          {customer.telefone && <span>📞 {customer.telefone}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Pedido
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-semibold mb-4">Novo Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex.: SM52 4 cores até 40k"
                value={form.titulo ?? ""}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detalhes do pedido..."
                value={form.descricao ?? ""}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orçamento máximo (€)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="40000"
                value={form.orcamentoMaximo ?? ""}
                onChange={(e) => setForm({ ...form, orcamentoMaximo: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origem do lead</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.origemLead ?? "WhatsApp"}
                onChange={(e) => setForm({ ...form, origemLead: e.target.value })}
              >
                {["WhatsApp", "Email", "Feira", "Indicação", "Website"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          {createOrderMutation.error && (
            <p className="text-red-500 text-sm mt-3">{(createOrderMutation.error as Error).message}</p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              disabled={!form.titulo || createOrderMutation.isPending}
              onClick={() =>
                createOrderMutation.mutate({ ...form, customerId: customerId! } as CreateOrderPayload)
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {createOrderMutation.isPending ? "A guardar..." : "Guardar"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loadingOrders ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState message="Nenhum pedido encontrado para este cliente." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{order.titulo}</p>
                  {order.descricao && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{order.descricao}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.createdAt).toLocaleDateString("pt-PT")} · {order.events?.length ?? 0} eventos
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
