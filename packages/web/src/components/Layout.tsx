/**
 * Layout Component
 * Provides sidebar and main area layout
 */

import type { ReactElement, ReactNode } from "react";

interface LayoutProps {
	sidebar: ReactNode;
	main: ReactNode;
}

export function Layout({ sidebar, main }: LayoutProps): ReactElement {
	return (
		<div
			style={{
				display: "flex",
				minHeight: "100vh",
				flexDirection: "row",
			}}
		>
			<aside
				style={{
					width: "300px",
					borderRight: "1px solid #ddd",
					backgroundColor: "#f8f9fa",
					overflow: "auto",
					flexShrink: 0,
				}}
			>
				{sidebar}
			</aside>
			<main
				style={{
					flex: 1,
					overflow: "auto",
					backgroundColor: "#fff",
				}}
			>
				{main}
			</main>
		</div>
	);
}
