import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { customersApi } from "../api/customers";
import { useDebounce } from "../hooks/useDebounce";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import toast from "react-hot-toast";
import type { CreateCustomerPayload, CustomerListItem } from "../types";

export function CustomersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCustomerPayload>({ nome: "" });
  const debouncedSearch = useDebounce(search);

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      toast.success("Cliente criado com sucesso! ✅");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setForm({ nome: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = (customers as CustomerListItem[]).filter(
    (c) =>
      c.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.empresa ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Cliente
        </button>
      </div>

      {/* Formulário novo cliente */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Novo Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Nome *", key: "nome", placeholder: "Nome do cliente" },
              { label: "Empresa", key: "empresa", placeholder: "Nome da empresa" },
              { label: "Email", key: "email", placeholder: "email@exemplo.com", type: "email" },
              { label: "Telefone", key: "telefone", placeholder: "+351 960 000 000" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={type ?? "text"}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  value={(form as Record<string, string>)[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          {createMutation.error && (
            <p className="text-red-500 text-sm mt-3">
              {(createMutation.error as Error).message}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              disabled={!form.nome || createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {createMutation.isPending ? "A guardar..." : "Guardar"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Barra de pesquisa */}
      <input
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Buscar por nome ou empresa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Conteúdo */}
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500 text-center py-8">Erro ao carregar clientes.</p>
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhum cliente encontrado." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nome</th>
                <th className="px-6 py-3 text-left">Pedidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((customer) => {
                // Apenas pedidos que NÃO estão fechados
                const pedidosAtivos = (customer.orders ?? []).filter(
                  (o) => o.status !== "FECHADO"
                );

                const temPedidos = pedidosAtivos.length > 0;

                // Máquinas de todos os pedidos ativos
                const maquinas = pedidosAtivos.flatMap((o) =>
                  (o.orderMachines ?? []).map((om) => ({
                    fabricante: om.machine.fabricante,
                    modelo: om.machine.modelo,
                    ano: om.machine.ano,
                  }))
                );

                // Pedidos ativos sem máquina associada ainda
                const pedidosSemMaquina = pedidosAtivos.filter(
                  (o) => (o.orderMachines ?? []).length === 0
                );

                return (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    {/* Nome + máquinas como notas de rodapé */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {customer.nome}
                      </p>

                      {/* Máquinas dos pedidos ativos */}
                      {maquinas.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          {maquinas.map((m, i) => (
                            <span
                              key={i}
                              className="text-xs text-gray-400 dark:text-gray-500"
                            >
                              {m.fabricante} {m.modelo}
                              {m.ano ? ` (${m.ano})` : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pedidos ativos sem máquina ainda — mostra título em itálico */}
                      {pedidosSemMaquina.length > 0 && maquinas.length === 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          {pedidosSemMaquina.map((o) => (
                            <span
                              key={o.id}
                              className="text-xs text-gray-400 dark:text-gray-500 italic"
                            >
                              {o.titulo}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Badge de status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {temPedidos ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Com pedido ({pedidosAtivos.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                          Sem pedido
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
