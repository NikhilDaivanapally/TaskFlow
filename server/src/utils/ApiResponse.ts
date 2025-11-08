interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export function ApiResponse<T>(
  statusCode: number,
  data: T,
  message = "success"
): ApiResponse<T> {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
}
