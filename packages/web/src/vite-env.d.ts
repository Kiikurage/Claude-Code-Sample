/// <reference types="vite/client" />

declare const __GIT_COMMIT_HASH__: string;
declare const __GIT_COMMIT_DATE__: string;
declare const __GIT_BRANCH__: string;

declare global {
	// biome-ignore lint/style/noVar: Required for global type extension
	var __GIT_COMMIT_HASH__: string;
	// biome-ignore lint/style/noVar: Required for global type extension
	var __GIT_COMMIT_DATE__: string;
	// biome-ignore lint/style/noVar: Required for global type extension
	var __GIT_BRANCH__: string;
}

export {};
