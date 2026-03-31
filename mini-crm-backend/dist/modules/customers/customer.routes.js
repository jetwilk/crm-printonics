"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = customerRoutes;
const customer_controller_1 = require("./customer.controller");
const customer_schema_1 = require("./customer.schema");
async function customerRoutes(app) {
    app.post("/customers", { schema: customer_schema_1.createCustomerSchema }, customer_controller_1.customerController.create);
    app.get("/customers", customer_controller_1.customerController.list);
    app.get("/customers/:id", customer_controller_1.customerController.getById);
}
