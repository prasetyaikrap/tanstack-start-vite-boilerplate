import { Box, type BoxProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { ENVS } from "@/configs/envs";

import { BoxAds } from "./box-ads";

type FloatingAddsProps = {
	boxProps?: BoxProps;
	offset?: {
		top?: number;
		bottom?: number;
	};
};

export function FloatingAds({ boxProps, offset }: FloatingAddsProps) {
	const [isShow, setIsShow] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const { scrollY, innerHeight } = window;
			const scrollPosition = scrollY + innerHeight;
			const pageHeight = document.documentElement.scrollHeight;
			const topOffset = offset?.top ?? 10;
			const bottomOffset = offset?.bottom ?? 10;
			const isShowed =
				scrollPosition >= innerHeight + topOffset &&
				scrollPosition <= pageHeight - bottomOffset;

			setIsShow(isShowed); // Allow small offset for precision
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [offset?.bottom, offset?.top]);

	return (
		<Box
			display={{ base: "none", xl: "block" }}
			zIndex={0}
			position="fixed"
			width="200px"
			{...boxProps}
			opacity={isShow ? 1 : 0}
			transition="all ease .4s"
		>
			<BoxAds pid={ENVS.GOOGLE_ADSENSE_ACCOUNT} />
		</Box>
	);
}
