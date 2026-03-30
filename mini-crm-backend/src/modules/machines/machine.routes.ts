import { FastifyInstance } from "fastify";
import { machineController } from "./machine.controller";

export async function machineRoutes(app: FastifyInstance) {
  app.get("/machines", machineController.list);
  app.post("/machines", machineController.create);
  app.get("/machines/:id", machineController.getById);
  app.patch("/machines/:id", machineController.update);
  app.patch("/machines/:id/arquivar", machineController.arquivar);
  app.patch("/machines/:id/desarquivar", machineController.desarquivar);
}
