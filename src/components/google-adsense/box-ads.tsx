import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { ENVS } from "@/configs/envs";

type BoxAdsProps = {
	pid: string;
	dataAdSlot?: string;
	dataAdFormat?: string;
	dataFullWidthResponsive?: "true" | "false";
};

export function BoxAds({
	pid,
	dataAdSlot = "3492632848",
	dataAdFormat = "auto",
	dataFullWidthResponsive = "true",
}: BoxAdsProps) {
	useEffect(() => {
		const initializeAds = () => {
			if (typeof window !== "undefined" && (window as any).adsbygoogle) {
				try {
					// biome-ignore lint/suspicious/noAssignInExpressions: false positive
					((window as any).adsbygoogle =
						(window as any).adsbygoogle || []).push({});
				} catch (error: any) {
					// eslint-disable-next-line no-console
					console.warn(error.message);
				}
			}
		};

		initializeAds();
	}, []);

	return (
		<Box
			width="full"
			bg={ENVS.APP_ENV === "production" ? "transparent" : "gray.100"}
		>
			<ins
				className="adsbygoogle"
				style={{
					display: "block",
					background: "transparent",
				}}
				data-ad-client={pid}
				data-ad-slot={dataAdSlot}
				data-ad-format={dataAdFormat}
				data-full-width-responsive={dataFullWidthResponsive}
			></ins>
		</Box>
	);
}
