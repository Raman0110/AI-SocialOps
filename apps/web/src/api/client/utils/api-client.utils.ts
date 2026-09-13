import type { AxiosError } from "axios";

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    message: string,
    options: {
      status?: number;
      details?: unknown;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export function getErrorMessage(error: AxiosError): string {
  const data = error.response?.data;

  if (
    data &&
    typeof data === "object" &&
    "title" in data &&
    typeof data.title === "string"
  ) {
    return data.title;
  }

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "The request timed out.";
  }

  if (!error.response) {
    return "Unable to reach the API.";
  }

  return error.message || "The API request failed.";
}