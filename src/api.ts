import type { Student } from "./index.ts";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function isStudent(data: unknown): data is Student {
  if (typeof data !== "object" || data === null) {
    console.error("Validation Error: Data must be a non-null object.");
    return false;
  }

  if (!("id" in data) || typeof (data as any).id !== "number") {
    console.error(
      `Validation Error: Missing or invalid 'id'. Expected a number, got ${typeof (data as any).id}.`,
    );
    return false;
  }

  if (!("name" in data) || typeof (data as any).name !== "string") {
    console.error(
      `Validation Error: Missing or invalid 'name'. Expected a string, got ${typeof (data as any).name}.`,
    );
    return false;
  }

  if (!("email" in data) || typeof (data as any).email !== "string") {
    console.error(
      `Validation Error: Missing or invalid 'email'. Expected a string, got ${typeof (data as any).email}.`,
    );
    return false;
  }

  if (
    !("status" in data) ||
    ((data as any).status !== "active" && (data as any).status !== "inactive")
  ) {
    console.error(
      `Validation Error: Missing or invalid 'status'. Expected 'active' or 'inactive', got '${(data as any).status}'.`,
    );
    return false;
  }

  // If all checks pass, return true and satisfy the type guard
  return true;
}
