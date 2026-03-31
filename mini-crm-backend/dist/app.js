"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const static_1 = __importDefault(require("@fastify/static")); // ← NOVO
const path_1 = __importDefault(require("path")); // ← NOVO
const customer_routes_1 = require("./modules/customers/customer.routes");
const order_routes_1 = require("./modules/orders/order.routes");
const event_routes_1 = require("./modules/events/event.routes");
const machine_routes_1 = require("./modules/machines/machine.routes");
const error_handler_1 = require("./shared/errors/error-handler");
async function buildApp() {
    const app = (0, fastify_1.default)({ logger: process.env.NODE_ENV === "development" });
    await app.register(cors_1.default, {
        origin: [
            "http://localhost:5173",
            "https://crm.printonicsapp.fr", // ← NOVO
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    });
    await app.register(sensible_1.default);
    // Serve o frontend React (pasta dist/) ← NOVO
    await app.register(static_1.default, {
        root: path_1.default.join(__dirname, "../../mini-crm-frontend/dist"),
        prefix: "/",
    });
    await app.register(customer_routes_1.customerRoutes);
    await app.register(order_routes_1.orderRoutes);
    await app.register(event_routes_1.eventRoutes);
    await app.register(machine_routes_1.machineRoutes);
    // Todas as rotas desconhecidas devolvem o index.html (React Router) ← NOVO
    app.setNotFoundHandler((_request, reply) => {
        reply.sendFile("index.html");
    });
    app.setErrorHandler(error_handler_1.errorHandler);
    return app;
}
