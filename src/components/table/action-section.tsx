import { Button, HStack } from "@chakra-ui/react";
import type { TableActions } from "./type";

type ActionSectionProps = {
	actions: TableActions[];
};

export function ActionSection({ actions }: ActionSectionProps) {
	if (actions.length <= 0) return null;

	return (
		<HStack>
			{actions.map((act) =>
				act.cell ? (
					act.cell({ key: act.name, id: act.name, ...act.buttonProps })
				) : (
					<Button
						key={act.name}
						id={act.name}
						colorPalette="teal"
						size="sm"
						variant="surface"
						data-testid={`btn_table-action-${act.name}`}
						{...act.buttonProps}
					>
						{act.startElement}
						{act.label} {act.endElement}
					</Button>
				),
			)}
		</HStack>
	);
}
