export type Twitter =
	| TwitterSummary
	| TwitterSummaryLargeImage
	| TwitterPlayer
	| TwitterApp
	| TwitterMetadata;
type TwitterMetadata = {
	site?: string | undefined;
	siteId?: string | undefined;
	creator?: string | undefined;
	creatorId?: string | undefined;
	description?: string | undefined;
	title?: string | undefined;
	images?: TwitterImage | Array<TwitterImage> | undefined;
	card?: "summary" | "summary_large_image" | "player" | "app" | undefined;
};
export type TwitterSummary = TwitterMetadata & {
	card: "summary";
};
export type TwitterSummaryLargeImage = TwitterMetadata & {
	card: "summary_large_image";
};
export type TwitterPlayer = TwitterMetadata & {
	card: "player";
	players: TwitterPlayerDescriptor | Array<TwitterPlayerDescriptor>;
};
export type TwitterApp = TwitterMetadata & {
	card: "app";
	app: TwitterAppDescriptor;
};
export type TwitterAppDescriptor = {
	id: {
		iphone?: string | number | undefined;
		ipad?: string | number | undefined;
		googleplay?: string | undefined;
	};
	url?:
		| {
				iphone?: string | URL | undefined;
				ipad?: string | URL | undefined;
				googleplay?: string | URL | undefined;
		  }
		| undefined;
	name?: string | undefined;
};
type TwitterImage = string | TwitterImageDescriptor | URL;
export type TwitterImageDescriptor = {
	url: string | URL;
	alt?: string | undefined;
	secureUrl?: string | URL | undefined;
	type?: string | undefined;
	width?: string | number | undefined;
	height?: string | number | undefined;
};
type TwitterPlayerDescriptor = {
	playerUrl: string | URL;
	streamUrl: string | URL;
	width: number;
	height: number;
};
type ResolvedTwitterImage = {
	url: string | URL;
	alt?: string | undefined;
	secureUrl?: string | URL | undefined;
	type?: string | undefined;
	width?: string | number | undefined;
	height?: string | number | undefined;
};
type ResolvedTwitterSummary = {
	site: string | null;
	siteId: string | null;
	creator: string | null;
	creatorId: string | null;
	description: string | null;
	title: string;
	images?: Array<ResolvedTwitterImage> | undefined;
};
type ResolvedTwitterPlayer = ResolvedTwitterSummary & {
	players: Array<TwitterPlayerDescriptor>;
};
type ResolvedTwitterApp = ResolvedTwitterSummary & {
	app: TwitterAppDescriptor;
};
export type ResolvedTwitterMetadata =
	| ({
			card: "summary";
	  } & ResolvedTwitterSummary)
	| ({
			card: "summary_large_image";
	  } & ResolvedTwitterSummary)
	| ({
			card: "player";
	  } & ResolvedTwitterPlayer)
	| ({
			card: "app";
	  } & ResolvedTwitterApp);
