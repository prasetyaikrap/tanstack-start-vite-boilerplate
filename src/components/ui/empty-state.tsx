import { EmptyState, VStack } from "@chakra-ui/react";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

export type EmptyStateComponentProps = {
	icon?: ReactNode;
	title?: string | ReactNode;
	description?: string | ReactNode;
	action?: ReactNode;
} & EmptyState.RootProps;

export function EmptyStateComponent({
	icon,
	title,
	description,
	action,
	...props
}: EmptyStateComponentProps) {
	return (
		<EmptyState.Root {...props}>
			<EmptyState.Content>
				<EmptyState.Indicator>{icon ?? <Search />}</EmptyState.Indicator>
				<VStack textAlign="center">
					<EmptyState.Title>{title ?? "Record is empty"}</EmptyState.Title>
					<EmptyState.Description>
						{description ?? "Add a new record to get started"}
					</EmptyState.Description>
				</VStack>
				{action}
			</EmptyState.Content>
		</EmptyState.Root>
	);
}
