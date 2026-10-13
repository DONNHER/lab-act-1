// Error Handling Utilities

export class AppError extends Error {
  public status: number | null;
  public errors: Record<string, string[]> | null;
  public originalError: unknown;

  constructor(
    message: string,
    status: number | null = null,
    errors: Record<string, string[]> | null = null,
    originalError: unknown = null
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.errors = errors;
    this.originalError = originalError;
  }

  static fromApiError(error: unknown): AppError {
    if (error instanceof AppError) return error;

    const apiError = error as { status?: number | null; message?: string; errors?: Record<string, string[]> } | null;
    if (apiError && typeof apiError === 'object' && 'status' in apiError) {
      return new AppError(
        apiError.message || 'An error occurred',
        apiError.status ?? null,
        apiError.errors ?? null,
        error
      );
    }

    if (error instanceof Error) {
      return new AppError(error.message, null, null, error);
    }

    return new AppError('An unknown error occurred', null, null, error);
  }

  get isNetworkError(): boolean {
    return this.status === null && this.originalError instanceof TypeError;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isServerError(): boolean {
    return this.status !== null && this.status >= 500;
  }

  getFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }

  getFirstError(): string | undefined {
    const firstField = Object.keys(this.errors || {})[0];
    return firstField ? this.errors![firstField][0] : undefined;
  }
}

export function handleApiError(error: unknown): AppError {
  return AppError.fromApiError(error);
}

export function getErrorMessage(error: unknown): string {
  const appError = handleApiError(error);
  return appError.message;
}