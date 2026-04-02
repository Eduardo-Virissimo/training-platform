export function getErrorMessage(error: unknown): string {
  if (!error) return '';

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string') {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    if (message !== undefined && message !== null) {
      return JSON.stringify(message);
    }

    return '';
  }

  return String(error);
}
