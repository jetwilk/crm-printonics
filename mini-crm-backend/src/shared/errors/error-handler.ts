import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./AppError";

export function errorHandler(
  error: FastifyError | AppError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code ?? "APP_ERROR",
      message: error.message,
    });
  }

  // Erros de validação do Fastify (JSON Schema)
  if ("statusCode" in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: error.message,
    });
  }

  console.error("[Unhandled Error]", error);
  return reply.status(500).send({
    error: "INTERNAL_ERROR",
    message: "Erro interno do servidor.",
  });
}
