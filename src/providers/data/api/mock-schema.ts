import { contract } from "@/providers/rest-client/handler";
import { schema as BaseSchema } from "./base";

const { BaseErrorResponse, BaseResponses } = BaseSchema;

export const mockRouter = contract({
	posts: {
		method: "GET",
		path: "/posts",
		summary: "Get Post for demo",
		response: {
			200: BaseResponses,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
});
