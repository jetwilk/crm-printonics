"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.machineRoutes = machineRoutes;
const machine_controller_1 = require("./machine.controller");
async function machineRoutes(app) {
    app.get("/machines", machine_controller_1.machineController.list);
    app.post("/machines", machine_controller_1.machineController.create);
    app.get("/machines/:id", machine_controller_1.machineController.getById);
    app.patch("/machines/:id", machine_controller_1.machineController.update);
    app.patch("/machines/:id/arquivar", machine_controller_1.machineController.arquivar);
    app.patch("/machines/:id/desarquivar", machine_controller_1.machineController.desarquivar);
}
