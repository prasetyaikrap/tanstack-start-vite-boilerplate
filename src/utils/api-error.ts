import { toaster } from "@/components/ui/toaster";
import type { ErrorDetail } from "@/providers/data/type";
import type { ApiError } from "@/types";

function isErrorDetail(value: unknown): value is ErrorDetail {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof (value as ErrorDetail).id === "string"
	);
}

// Returns the backend error id (matches the server log line), falling back to the request id
export function getErrorReference(error: unknown): string | undefined {
	const apiError = error as ApiError | undefined;
	if (isErrorDetail(apiError?.error)) {
		return apiError.error.id;
	}

	return apiError?.requestId;
}

// Shows an API error as a toast, with the error reference so users can quote it to support, e.g.
//
//	useCreate({ resource: "users", onError: (error) => showErrorToast(error) })
export function showErrorToast(error: unknown, title?: string) {
	const apiError = error as ApiError | undefined;
	const reference = getErrorReference(error);

	toaster.create({
		type: "error",
		title: title ?? apiError?.message ?? "Something went wrong",
		description: reference ? `Error ID: ${reference}` : undefined,
	});
}
