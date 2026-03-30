import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { customersApi } from "../api/customers";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";

import type { CreateCustomerPayload } from "../types";

const fields: Array<{
  label: string;
  key: keyof CreateCustomerPayload;
  placeholder: string;
}> = [
  { label: "Nome *", key: "nome", placeholder: "Nome do cliente" },
  { label: "Email", key: "email", placeholder: "email@exemplo.com" },
  { label: "Telefone", key: "telefone", placeholder: "+351 ..." },
  { label: "Empresa", key: "empresa", placeholder: "Empresa" },
];

export function CustomersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCustomerPayload>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
  });

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customersApi.create(payload),
    onSuccess: () => {
      toast.success("Cliente criado com sucesso! ✅");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setForm({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Novo Cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  value={form[key] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
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
              disabled={!form.nome.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {createMutation.isPending ? "A guardar..." : "Guardar"}
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

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500 text-center py-8">Erro ao carregar clientes.</p>
      ) : customers.length === 0 ? (
        <EmptyState message="Nenhum cliente encontrado." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-lg">{customer.nome}</h3>

              {customer.empresa && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {customer.empresa}
                </p>
              )}

              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {customer.email && <p>📧 {customer.email}</p>}
                {customer.telefone && <p>📞 {customer.telefone}</p>}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Criado em {new Date(customer.createdAt).toLocaleDateString("pt-PT")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}