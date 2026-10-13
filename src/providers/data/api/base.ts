import z from "zod";

const BaseMetadata = z
	.object({
		total_count: z.number(),
		current_page: z.number(),
		total_page: z.number(),
		per_page: z.number(),
		next_cursor: z.string().nullish(),
		prev_cursor: z.string().nullish(),
	})
	.passthrough();
const BaseResponse = z
	.object({ code: z.number(), message: z.string() })
	.passthrough();
const BaseResponses = z
	.object({ code: z.number(), message: z.string(), metadata: BaseMetadata })
	.passthrough();
const BaseErrorResponse = z
	.object({
		code: z.number(),
		message: z.string(),
		error: z
			.object({
				id: z.string(),
				type: z.string(),
				code: z.number(),
				data: z.unknown(),
			})
			.passthrough(),
	})
	.passthrough();
const BaseIdResponse = z
	.object({
		data: z.object({ id: z.string() }).passthrough(),
		code: z.number(),
		message: z.string(),
	})
	.passthrough();

const BlobResponse = z.instanceof(Blob);

export const schema = {
	BaseMetadata,
	BaseResponse,
	BaseResponses,
	BaseIdResponse,
	BaseErrorResponse,
	BlobResponse,
};
