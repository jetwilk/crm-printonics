"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerSchema = void 0;
exports.createCustomerSchema = {
    body: {
        type: "object",
        required: ["nome"],
        properties: {
            nome: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            telefone: { type: "string" },
            empresa: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
    },
};
