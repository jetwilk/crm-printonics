"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = eventRoutes;
const event_controller_1 = require("./event.controller");
const event_schema_1 = require("./event.schema");
async function eventRoutes(app) {
    app.post("/orders/:orderId/events/note", { schema: event_schema_1.addNoteSchema }, event_controller_1.eventController.addNote);
    app.patch("/orders/:orderId/status", { schema: event_schema_1.changeStatusSchema }, event_controller_1.eventController.changeStatus);
    app.post("/orders/:orderId/machines", { schema: event_schema_1.linkMachineSchema }, event_controller_1.eventController.linkMachine);
}
