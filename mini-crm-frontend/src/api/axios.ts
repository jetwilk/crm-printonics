import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "https://brown-seahorse-175384.hostingersite.com";

export const api = axios.create({
  baseURL,
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