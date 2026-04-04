import {
	AspectRatio,
	type AspectRatioProps,
	Center,
	Dialog,
	Image,
	type ImageProps,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { PortalWrapper } from "../ui/portal-wrapper";

export type CustomImageProps = {
	aspectRatioProps?: AspectRatioProps;
	imageProps?: ImageProps;
	preview?: boolean;
};

export default function CustomImage({
	aspectRatioProps,
	imageProps,
	preview = true,
}: CustomImageProps) {
	const [isHovered, setIsHovered] = useState(false);
	const useDisclosureProps = useDisclosure();
	const { open, onToggle } = useDisclosureProps;

	if (!preview) {
		return (
			<AspectRatio zIndex={1} width="300px" ratio={4 / 3} {...aspectRatioProps}>
				<Image borderRadius=".5em" objectFit="cover" alt="" {...imageProps} />
			</AspectRatio>
		);
	}

	return (
		<Dialog.Root
			lazyMount
			open={open}
			onOpenChange={onToggle}
			motionPreset="scale"
			placement="center"
			size={{ mdDown: "md", md: "xl" }}
			closeOnInteractOutside
		>
			<Dialog.Trigger>
				<Center
					position="relative"
					cursor="pointer"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onTouchStart={() => setIsHovered(true)}
					onTouchEnd={() => setIsHovered(false)}
				>
					<AspectRatio
						zIndex={1}
						width="300px"
						ratio={4 / 3}
						{...aspectRatioProps}
					>
						<Image
							borderRadius=".5em"
							objectFit="cover"
							alt=""
							{...imageProps}
						/>
					</AspectRatio>
					<Center
						position="absolute"
						width="full"
						height="full"
						zIndex={isHovered ? 2 : 0}
						borderRadius=".5em"
						transition="all ease 0.5s"
						bg={isHovered ? "rgba(0,0,0,0.4)" : "transparent"}
					>
						<Text color="white" fontSize="1rem">
							preview
						</Text>
					</Center>
				</Center>
			</Dialog.Trigger>
			<PortalWrapper portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Image
							width="full"
							src={imageProps?.src}
							alt={imageProps?.alt}
							objectFit="contain"
							borderRadius=".5em"
						/>
					</Dialog.Content>
				</Dialog.Positioner>
			</PortalWrapper>
		</Dialog.Root>
	);
}
