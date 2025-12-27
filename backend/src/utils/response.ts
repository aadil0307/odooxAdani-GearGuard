interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export const successResponse = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});
