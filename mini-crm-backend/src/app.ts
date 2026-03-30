import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
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
      "http://printonics.zyns.com:5173",
      "http://printonics.zyns.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  await app.register(sensible);
  await app.register(customerRoutes);
  await app.register(orderRoutes);
  await app.register(eventRoutes);
  await app.register(machineRoutes);
  
  // Adiciona antes do setErrorHandler
app.get("/", async (_request, reply) => {
  return reply.send({ status: "ok", app: "Printonics CRM API" });
});

  app.setErrorHandler(errorHandler);
  return app;
}
