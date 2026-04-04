import {
	Toaster as ChakraToaster,
	createToaster,
	Portal,
	Spinner,
	Stack,
	Toast,
} from "@chakra-ui/react";

type ToasterProps = {
	toaster?: ReturnType<typeof createToaster>;
};

export const toaster = createToaster({
	placement: "top-end",
	pauseOnPageIdle: true,
});

export const Toaster = ({ toaster: customToaster }: ToasterProps) => {
	return (
		<Portal>
			<ChakraToaster
				toaster={customToaster || toaster}
				insetInline={{ mdDown: "4" }}
			>
				{(toast) => (
					<Toast.Root width={{ md: "sm" }}>
						{toast.type === "loading" ? (
							<Spinner size="sm" color="blue.solid" />
						) : (
							<Toast.Indicator boxSize="20px !important" />
						)}
						<Stack gap="1" flex="1" maxWidth="100%">
							{toast.title && <Toast.Title>{toast.title}</Toast.Title>}
							{toast.description && (
								<Toast.Description>{toast.description}</Toast.Description>
							)}
						</Stack>
						{toast.action && (
							<Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
						)}
						{toast.meta?.closable && <Toast.CloseTrigger />}
					</Toast.Root>
				)}
			</ChakraToaster>
		</Portal>
	);
};
