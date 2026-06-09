import {
	Button,
	type ButtonProps,
	FileUpload as ChakraFileUpload,
	type UseFileUploadReturn,
} from "@chakra-ui/react";

type FileUploadProps = {
	children: React.ReactNode;
	fileUploadProps: UseFileUploadReturn;
} & ButtonProps;

export function FileUploadBtn({
	children,
	fileUploadProps,
	...buttonProps
}: FileUploadProps) {
	return (
		<ChakraFileUpload.RootProvider value={fileUploadProps}>
			<ChakraFileUpload.HiddenInput />
			<ChakraFileUpload.Trigger asChild>
				<Button {...buttonProps}>{children}</Button>
			</ChakraFileUpload.Trigger>
		</ChakraFileUpload.RootProvider>
	);
}
