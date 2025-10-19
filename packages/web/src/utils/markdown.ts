import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Configure marked for safe rendering
 */
marked.setOptions({
	breaks: true,
	gfm: true,
});

/**
 * Parses Markdown text and returns sanitized HTML
 * @param markdown - Markdown text to parse
 * @returns Sanitized HTML string
 */
export function parseMarkdown(markdown: string): string {
	try {
		const html = marked.parse(markdown);
		const htmlString = typeof html === "string" ? html : "";
		// Sanitize the HTML to prevent XSS attacks
		return DOMPurify.sanitize(htmlString);
	} catch (error) {
		console.error("Failed to parse Markdown:", error);
		return "";
	}
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
	return DOMPurify.sanitize(html);
}
