import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { machinesApi } from "../api/machines";
import { useDebounce } from "../hooks/useDebounce";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";

import type { Machine } from "../types";

type MachineWithArchive = Machine & {
  arquivada?: boolean;
};

type MachineForm = {
  fabricante: string;
  modelo: string;
  ano?: number;
  pais?: string;
  formato?: string;
  cores?: number;
  precoPedido?: number;
  moeda: string;
  urlAnuncio?: string;
  notasTecnicas?: string;
};

const FIELDS: Array<{
  label: string;
  key: keyof MachineForm;
  placeholder: string;
  type?: "text" | "number";
}> = [
  { label: "Fabricante *", key: "fabricante", placeholder: "Ex: Heidelberg" },
  { label: "Modelo *", key: "modelo", placeholder: "Ex: SM52-4" },
  { label: "Ano", key: "ano", placeholder: "Ex: 2007", type: "number" },
  { label: "País", key: "pais", placeholder: "Ex: Alemanha" },
  { label: "Formato", key: "formato", placeholder: "Ex: 52x74cm" },
  { label: "Cores", key: "cores", placeholder: "Ex: 4", type: "number" },
  { label: "Preço (€)", key: "precoPedido", placeholder: "Ex: 35000", type: "number" },
  { label: "URL Anúncio", key: "urlAnuncio", placeholder: "https://..." },
];

const emptyForm: MachineForm = {
  fabricante: "",
  modelo: "",
  moeda: "EUR",
};

export function MachinesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showArquivadas, setShowArquivadas] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineWithArchive | null>(null);
  const [form, setForm] = useState<MachineForm>(emptyForm);

  const debouncedSearch = useDebounce(search);
  const queryKey = ["machines", showArquivadas];

  const { data: machines = [], isLoading, error } = useQuery<MachineWithArchive[]>({
    queryKey,
    queryFn: () => machinesApi.list(showArquivadas) as Promise<MachineWithArchive[]>,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MachineForm }) => machinesApi.update(id, data),
    onSuccess: () => {
      toast.success("Máquina atualizada! ✅");
      queryClient.invalidateQueries({ queryKey });
      setEditingMachine(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const arquivarMutation = useMutation({
    mutationFn: (id: string) => machinesApi.arquivar(id),
    onSuccess: () => {
      toast.success("Máquina arquivada!");
      queryClient.invalidateQueries({ queryKey: ["machines", false] });
      queryClient.invalidateQueries({ queryKey: ["machines", true] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const desarquivarMutation = useMutation({
    mutationFn: (id: string) => machinesApi.desarquivar(id),
    onSuccess: () => {
      toast.success("Máquina reativada!");
      queryClient.invalidateQueries({ queryKey: ["machines", false] });
      queryClient.invalidateQueries({ queryKey: ["machines", true] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = machines.filter((m) => {
    const term = debouncedSearch.toLowerCase();
    return (
      m.fabricante.toLowerCase().includes(term) ||
      m.modelo.toLowerCase().includes(term) ||
      (m.pais ?? "").toLowerCase().includes(term)
    );
  });

  function openEdit(machine: MachineWithArchive) {
    setEditingMachine(machine);
    setForm({
      fabricante: machine.fabricante,
      modelo: machine.modelo,
      ano: machine.ano ?? undefined,
      pais: machine.pais ?? "",
      formato: machine.formato ?? "",
      cores: machine.cores ?? undefined,
      precoPedido: machine.precoPedido != null ? Number(machine.precoPedido) : undefined,
      moeda: machine.moeda ?? "EUR",
      urlAnuncio: machine.urlAnuncio ?? "",
      notasTecnicas: machine.notasTecnicas ?? "",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🖨️ Máquinas</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} máquina{filtered.length !== 1 ? "s" : ""}
          </span>

          <button
            onClick={() => setShowArquivadas((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              showArquivadas
                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {showArquivadas ? "📦 A ver arquivadas" : "📦 Ver arquivadas"}
          </button>
        </div>
      </div>

      <input
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-6 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Buscar por fabricante, modelo ou país..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">✏️ Editar Máquina</h2>

              <button
                onClick={() => setEditingMachine(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELDS.map(({ label, key, placeholder, type }) => {
                const rawValue = form[key];
                const inputValue =
                  typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : "";

                return (
                  <div key={String(key)}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                      type={type ?? "text"}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={placeholder}
                      value={inputValue}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]:
                            type === "number"
                              ? e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  </div>
                );
              })}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notas técnicas</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Estado, contador, revisões..."
                  value={form.notasTecnicas ?? ""}
                  onChange={(e) => setForm({ ...form, notasTecnicas: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                disabled={!form.fabricante || !form.modelo || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ id: editingMachine.id, data: form })}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {updateMutation.isPending ? "A guardar..." : "Guardar alterações"}
              </button>

              <button
                onClick={() => setEditingMachine(null)}
                className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500 text-center py-8">Erro ao carregar máquinas.</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={showArquivadas ? "Nenhuma máquina arquivada." : "Nenhuma máquina encontrada."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((machine) => {
            const arquivada = machine.arquivada ?? false;

            return (
              <div
                key={machine.id}
                className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm transition-all ${
                  arquivada
                    ? "border-amber-200 dark:border-amber-800 opacity-75"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {machine.fabricante}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {machine.modelo}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {machine.ano && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
                        {machine.ano}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                  {machine.formato && (
                    <div className="flex items-center gap-2">
                      <span>📐</span>
                      <span>{machine.formato}</span>
                    </div>
                  )}

                  {machine.cores != null && (
                    <div className="flex items-center gap-2">
                      <span>🎨</span>
                      <span>{machine.cores} cores</span>
                    </div>
                  )}

                  {machine.pais && (
                    <div className="flex items-center gap-2">
                      <span>🌍</span>
                      <span>{machine.pais}</span>
                    </div>
                  )}

                  {machine.precoPedido != null && (
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {Number(machine.precoPedido).toLocaleString("pt-PT")} {machine.moeda}
                      </span>
                    </div>
                  )}
                </div>

                {machine.notasTecnicas && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 line-clamp-2">
                    📋 {machine.notasTecnicas}
                  </p>
                )}

                {machine.urlAnuncio && (
                  <a
                    href={machine.urlAnuncio}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver anúncio ↗
                  </a>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {new Date(machine.createdAt).toLocaleDateString("pt-PT")}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(machine)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      ✏️ Editar
                    </button>

                    {arquivada ? (
                      <button
                        onClick={() => desarquivarMutation.mutate(machine.id)}
                        disabled={desarquivarMutation.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 transition-colors font-medium"
                      >
                        ♻️ Reativar
                      </button>
                    ) : (
                      <button
                        onClick={() => arquivarMutation.mutate(machine.id)}
                        disabled={arquivarMutation.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
                      >
                        📦 Arquivar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}