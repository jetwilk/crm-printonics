import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import staticFiles from "@fastify/static"; // ← NOVO
import path from "path";                   // ← NOVO
import { customerRoutes } from "./modules/customers/customer.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { eventRoutes } from "./modules/events/event.routes";
import { machineRoutes } from "./modules/machines/machine.routes";
import { errorHandler } from "./shared/errors/error-handler";

export async function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV === "development" });

  await app.register(cors, {
    origin: [
      "http://localhost:5173",
      "https://crm.printonicsapp.fr", // ← NOVO
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  await app.register(sensible);

  // Serve o frontend React (pasta dist/) ← NOVO
  await app.register(staticFiles, {
    root: path.join(__dirname, "../../mini-crm-frontend/dist"),
    prefix: "/",
  });

  await app.register(customerRoutes);
  await app.register(orderRoutes);
  await app.register(eventRoutes);
  await app.register(machineRoutes);

  // Todas as rotas desconhecidas devolvem o index.html (React Router) ← NOVO
  app.setNotFoundHandler((_request, reply) => {
    reply.sendFile("index.html");
  });

  app.setErrorHandler(errorHandler);
  return app;
}