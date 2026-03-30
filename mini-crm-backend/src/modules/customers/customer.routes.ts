import { FastifyInstance } from "fastify";
import { customerController } from "./customer.controller";
import { createCustomerSchema } from "./customer.schema";

export async function customerRoutes(app: FastifyInstance) {
  app.post("/customers", { schema: createCustomerSchema }, customerController.create);
  app.get("/customers", customerController.list);
  app.get("/customers/:id", customerController.getById);
}
