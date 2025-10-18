/**
 * BuildInfo Component - Displays build metadata in the bottom right corner
 */

import type { ReactElement } from "react";

export function BuildInfo(): ReactElement {
	const commitHash = __GIT_COMMIT_HASH__;
	const commitDate = __GIT_COMMIT_DATE__;
	const branch = __GIT_BRANCH__;

	const shortHash = commitHash.substring(0, 7);
	const date = new Date(commitDate);
	const formattedDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}`;
	const showBranch = branch !== "master" && branch !== "unknown";

	return (
		<div
			style={{
				fontSize: "10px",
				color: "#999",
				padding: "20px",
				fontFamily: "monospace",
				lineHeight: "1.4",
				textAlign: "center",
			}}
		>
			<div>
				commit:{" "}
				<a
					href={`https://github.com/Kiikurage/Claude-Code-Sample/commit/${commitHash}`}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "#666",
						textDecoration: "none",
					}}
					title={commitHash}
				>
					{shortHash}
				</a>
			</div>
			<div>{formattedDate}</div>
			{showBranch && <div>branch: {branch}</div>}
		</div>
	);
}
