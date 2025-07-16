export interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
            error?: Record<string, string[]>;
        };
    };
}

export function parseErrorMessage(err: unknown, template?: string): string {
    const axiosError = err as AxiosErrorResponse;

    if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof axiosError.response?.data?.message === "string"
    ) {
        return axiosError.response!.data!.message!;
    }

    if (err instanceof Error) return err.message;

    return template ?? "Unknown error occurred.";
}