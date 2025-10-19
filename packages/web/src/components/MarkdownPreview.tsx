/**
 * MarkdownPreview Component
 * Renders Markdown content as formatted HTML
 */

import type { ReactElement } from "react";
import { parseMarkdown } from "../utils/markdown.js";

interface MarkdownPreviewProps {
	content: string;
}

export function MarkdownPreview({
	content,
}: MarkdownPreviewProps): ReactElement {
	const html = parseMarkdown(content);

	return (
		<div
			className="markdown-preview"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with DOMPurify
			dangerouslySetInnerHTML={{ __html: html }}
			style={{
				flex: 1,
				padding: "12px",
				fontSize: "14px",
				border: "1px solid #ccc",
				borderRadius: "4px",
				boxSizing: "border-box",
				overflow: "auto",
				backgroundColor: "#f9f9f9",
				lineHeight: "1.6",
			}}
		/>
	);
}
