export class HTTPError<TError = any> extends Error {
	public readonly statusCode: number;
	public readonly error?: TError;
	public readonly requestId?: string;

	constructor(
		message: string,
		statusCode: number,
		error?: TError,
		requestId?: string,
	) {
		super(message);
		this.name = "HTTPError";
		this.statusCode = statusCode;
		this.error = error;
		this.requestId = requestId;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HTTPError);
		}
	}
}
