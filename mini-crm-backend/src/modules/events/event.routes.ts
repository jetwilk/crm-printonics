import { FastifyInstance } from "fastify";
import { eventController } from "./event.controller";
import { addNoteSchema, changeStatusSchema, linkMachineSchema } from "./event.schema";

export async function eventRoutes(app: FastifyInstance) {
  app.post(
    "/orders/:orderId/events/note",
    { schema: addNoteSchema },
    eventController.addNote
  );
  app.patch(
    "/orders/:orderId/status",
    { schema: changeStatusSchema },
    eventController.changeStatus
  );
  app.post(
    "/orders/:orderId/machines",
    { schema: linkMachineSchema },
    eventController.linkMachine
  );
}
