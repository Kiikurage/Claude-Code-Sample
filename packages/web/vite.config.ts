import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function getGitInfo() {
	try {
		const commitHash = execSync("git rev-parse HEAD").toString().trim();
		const commitDate = execSync("git log -1 --format=%cI").toString().trim();
		const branch = execSync("git rev-parse --abbrev-ref HEAD")
			.toString()
			.trim();
		return { commitHash, commitDate, branch };
	} catch (error) {
		console.warn("Failed to get git info:", error);
		return {
			commitHash: "unknown",
			commitDate: new Date().toISOString(),
			branch: "unknown",
		};
	}
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: process.env.NODE_ENV === "production" ? "/Claude-Code-Sample/" : "/",
	define: {
		__GIT_COMMIT_HASH__: JSON.stringify(getGitInfo().commitHash),
		__GIT_COMMIT_DATE__: JSON.stringify(getGitInfo().commitDate),
		__GIT_BRANCH__: JSON.stringify(getGitInfo().branch),
	},
	server: {
		port: 3000,
		open: false,
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
});
