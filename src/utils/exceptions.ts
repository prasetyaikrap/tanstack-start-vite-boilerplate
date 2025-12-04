export class HTTPError<TError = any> extends Error {
	public readonly statusCode: number;
	public readonly error?: TError;

	constructor(message: string, statusCode: number, error?: TError) {
		super(message);
		this.name = "HTTPError";
		this.statusCode = statusCode;
		this.error = error;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HTTPError);
		}
	}
}
