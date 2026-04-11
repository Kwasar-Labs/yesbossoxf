export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): HttpError {
    return new HttpError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required"): HttpError {
    return new HttpError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Insufficient permissions"): HttpError {
    return new HttpError(403, "FORBIDDEN", message);
  }

  static notFound(resource: string): HttpError {
    return new HttpError(404, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, "CONFLICT", message);
  }

  static internal(message = "Internal server error"): HttpError {
    return new HttpError(500, "INTERNAL_ERROR", message);
  }
}
