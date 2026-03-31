"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const order_controller_1 = require("./order.controller");
const order_schema_1 = require("./order.schema");
async function orderRoutes(app) {
    app.post("/orders", { schema: order_schema_1.createOrderSchema }, order_controller_1.orderController.create);
    app.get("/customers/:customerId/orders", order_controller_1.orderController.listByCustomer);
    app.get("/orders/:id", order_controller_1.orderController.getById);
}
