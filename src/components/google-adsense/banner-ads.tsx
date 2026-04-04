import { Flex, type FlexProps } from "@chakra-ui/react";
import { ENVS } from "@/configs/envs";
import { BoxAds } from "./box-ads";

export type BannerAdsProps = {
	flexProps?: FlexProps;
};

export function BannerAds({ flexProps }: BannerAdsProps) {
	return (
		<Flex width="full" {...flexProps}>
			<BoxAds pid={ENVS.GOOGLE_ADSENSE_ACCOUNT} />
		</Flex>
	);
}
