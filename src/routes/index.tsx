import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	context: () => {
		return { name: "HOME" };
	},
	component: App,
});

function App() {
	return (
		<div>
			<div>Welcome to the TanStack React Router Vite Boilerplate!</div>
		</div>
	);
}
