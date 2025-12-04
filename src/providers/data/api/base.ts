import z from "zod";

const BaseMetadata = z
  .object({
    total_rows: z.number(),
    current_page: z.number(),
    total_page: z.number(),
    per_page: z.number(),
    previousCursor: z.string(),
    nextCursor: z.string(),
  })
  .passthrough();
const BaseResponse = z
  .object({ success: z.boolean(), message: z.string() })
  .passthrough();
const BaseResponses = z
  .object({ success: z.boolean(), message: z.string(), metadata: BaseMetadata })
  .passthrough();
const BaseErrorResponse = z
  .object({
    success: z.boolean(),
    message: z.string(),
    error: z.object({}).passthrough(),
  })
  .passthrough();
const BaseIdResponse = z
  .object({
    data: z.object({ id: z.string() }).passthrough(),
    success: z.boolean(),
    message: z.string(),
  })
  .passthrough();

export const schema = {
  BaseMetadata,
  BaseResponse,
  BaseResponses,
  BaseIdResponse,
  BaseErrorResponse,
};
