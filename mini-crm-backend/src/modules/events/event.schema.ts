export const addNoteSchema = {
  body: {
    type: "object",
    required: ["mensagem"],
    properties: {
      mensagem: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
} as const;

export const changeStatusSchema = {
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
} as const;

export const linkMachineSchema = {
  body: {
    type: "object",
    required: ["machineId"],
    properties: {
      machineId: { type: "string" },
      mensagem:  { type: "string" },
    },
    additionalProperties: false,
  },
} as const;
