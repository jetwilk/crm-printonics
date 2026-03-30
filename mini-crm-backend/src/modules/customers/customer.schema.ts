export const createCustomerSchema = {
  body: {
    type: "object",
    required: ["nome"],
    properties: {
      nome:     { type: "string", minLength: 1 },
      email:    { type: "string", format: "email" },
      telefone: { type: "string" },
      empresa:  { type: "string" },
      tags:     { type: "array", items: { type: "string" } },
    },
    additionalProperties: false,
  },
} as const;
