import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";

import { AuthzError } from "../../../packages/authz/src/index.ts";
import { TicketDomainError } from "../../../packages/capabilities/handoff/src/index.ts";

export type ConversationTicketApiErrorCode =
  | "conversation_not_found"
  | "missing_access_context"
  | "state_conflict"
  | "ticket_not_found"
  | "validation_error";

export class ConversationTicketApiError extends Error {
  constructor(
    readonly code: ConversationTicketApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ConversationTicketApiError";
  }
}

export function requireFound<T>(
  value: T | undefined,
  code: "conversation_not_found" | "ticket_not_found",
  message: string
): T {
  if (!value) throw new ConversationTicketApiError(code, message);
  return value;
}

export function requireText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ConversationTicketApiError("validation_error", `${name} is required`);
  }
  return value.trim();
}

export function validationError(message: string): ConversationTicketApiError {
  return new ConversationTicketApiError("validation_error", message);
}

export function stateConflict(): ConversationTicketApiError {
  return new ConversationTicketApiError("state_conflict", "support state conflict");
}

export function missingAccessContext(): ConversationTicketApiError {
  return new ConversationTicketApiError(
    "missing_access_context",
    "access context is required"
  );
}

export function toConversationTicketHttpException(error: unknown): unknown {
  if (isHttpExceptionLike(error)) return error;

  if (isConversationTicketApiError(error)) {
    if (error.code === "conversation_not_found" || error.code === "ticket_not_found") {
      return new NotFoundException(error.message);
    }
    if (error.code === "missing_access_context") {
      return new ForbiddenException(error.message);
    }
    if (error.code === "state_conflict") {
      return new ConflictException(error.message);
    }
    return new BadRequestException(error.message);
  }

  if (isTicketDomainError(error)) {
    if (error.code === "locked_by_another_user") {
      return new ConflictException(error.message);
    }
    return new BadRequestException(error.message);
  }

  if (error instanceof AuthzError) {
    return new ForbiddenException(error.message);
  }

  return error;
}

function isHttpExceptionLike(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "statusCode" in error || "status" in error || "getStatus" in error;
}

function isConversationTicketApiError(
  error: unknown
): error is ConversationTicketApiError {
  return (
    error instanceof ConversationTicketApiError ||
    isNamedErrorWithCode(error, "ConversationTicketApiError")
  );
}

function isTicketDomainError(error: unknown): error is TicketDomainError {
  return (
    error instanceof TicketDomainError ||
    isNamedErrorWithCode(error, "TicketDomainError")
  );
}

function isNamedErrorWithCode(
  error: unknown,
  name: "ConversationTicketApiError" | "TicketDomainError"
): error is Error & { code: string } {
  return (
    error instanceof Error &&
    error.name === name &&
    typeof (error as { code?: unknown }).code === "string"
  );
}
