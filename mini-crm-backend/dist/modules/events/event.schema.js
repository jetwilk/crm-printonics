"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkMachineSchema = exports.changeStatusSchema = exports.addNoteSchema = void 0;
exports.addNoteSchema = {
    body: {
        type: "object",
        required: ["mensagem"],
        properties: {
            mensagem: { type: "string", minLength: 1 },
        },
        additionalProperties: false,
    },
};
exports.changeStatusSchema = {
    body: {
        type: "object",
        required: ["status"],
        properties: {
            status: {
                type: "string",
                enum: ["ABERTO", "PESQUISANDO", "PROPOSTA_ENVIADA", "FECHADO", "PERDIDO"],
            },
        },
        additionalProperties: false,
    },
};
exports.linkMachineSchema = {
    body: {
        type: "object",
        required: ["machineId"],
        properties: {
            machineId: { type: "string" },
            mensagem: { type: "string" },
        },
        additionalProperties: false,
    },
};
