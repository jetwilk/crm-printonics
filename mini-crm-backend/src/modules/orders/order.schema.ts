export const createOrderSchema = {
  body: {
    type: "object",
    required: ["customerId", "titulo"],
    properties: {
      customerId:      { type: "string" },
      titulo:          { type: "string", minLength: 1 },
      descricao:       { type: "string" },
      orcamentoMaximo: { type: "number", minimum: 0 },
      moeda:           { type: "string", default: "EUR" },
      prazoDesejado:   { type: "string", format: "date-time" },
      origemLead:      { type: "string" },
    },
    additionalProperties: false,
  },
} as const;
