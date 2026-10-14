import type { SystemStyleObject } from "@chakra-ui/react";

export const customScrollbarStyles: SystemStyleObject = {
	scrollbarWidth: "thin",
	scrollbarColor: "var(--chakra-colors-teal-500) var(--chakra-colors-teal-100)",
	"&::-webkit-scrollbar": {
		width: "10px",
	},
	"&::-webkit-scrollbar-track": {
		background: "var(--chakra-colors-teal-100)",
		borderRadius: "999px",
	},
	"&::-webkit-scrollbar-thumb": {
		background: "var(--chakra-colors-teal-500)",
		borderRadius: "999px",
		border: "2px solid var(--chakra-colors-teal-100)",
	},
	"&::-webkit-scrollbar-thumb:hover": {
		background: "var(--chakra-colors-teal-600)",
	},
};
