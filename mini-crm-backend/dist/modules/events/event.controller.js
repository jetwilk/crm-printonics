"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventController = void 0;
const event_use_cases_1 = require("./event.use-cases");
exports.eventController = {
    async addNote(request, reply) {
        const event = await event_use_cases_1.eventUseCases.addNote(request.params.orderId, request.body.mensagem);
        return reply.status(201).send(event);
    },
    async changeStatus(request, reply) {
        const result = await event_use_cases_1.eventUseCases.changeStatus(request.params.orderId, request.body.status);
        return reply.send(result);
    },
    async linkMachine(request, reply) {
        const result = await event_use_cases_1.eventUseCases.linkMachine(request.params.orderId, request.body.machineId, request.body.mensagem);
        return reply.status(201).send(result);
    },
};
