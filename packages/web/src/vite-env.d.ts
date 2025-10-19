/// <reference types="vite/client" />

declare const __GIT_COMMIT_HASH__: string;
declare const __GIT_COMMIT_DATE__: string;
declare const __GIT_BRANCH__: string;

declare global {
	var __GIT_COMMIT_HASH__: string;
	var __GIT_COMMIT_DATE__: string;
	var __GIT_BRANCH__: string;
}

export {};
