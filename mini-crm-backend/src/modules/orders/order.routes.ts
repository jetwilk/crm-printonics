import { FastifyInstance } from "fastify";
import { orderController } from "./order.controller";
import { createOrderSchema } from "./order.schema";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders", { schema: createOrderSchema }, orderController.create);
  app.get("/customers/:customerId/orders", orderController.listByCustomer);
  app.get("/orders/:id", orderController.getById);
}