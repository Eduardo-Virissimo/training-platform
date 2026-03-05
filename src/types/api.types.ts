export type ApiResponse<T> = {
  msg?: string;
  data?: T;
  error?: string;
};
