import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? "Erro inesperado. Tenta novamente.";
    console.error("[API Error]", message, error.response?.status);
    return Promise.reject(new Error(message));
  }
);
