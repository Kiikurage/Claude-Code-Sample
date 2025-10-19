/**
 * Markdown utility functions tests
 */

import { describe, expect, it } from "bun:test";
import { parseMarkdown, sanitizeHtml } from "./markdown.js";

describe("parseMarkdown", () => {
	it("parses bold text", () => {
		const result = parseMarkdown("**bold text**");
		expect(result).toContain("<strong>bold text</strong>");
	});

	it("parses italic text", () => {
		const result = parseMarkdown("*italic text*");
		expect(result).toContain("<em>italic text</em>");
	});

	it("parses headers", () => {
		const result = parseMarkdown("# Header 1");
		expect(result).toContain("<h1>Header 1</h1>");
	});

	it("parses links", () => {
		const result = parseMarkdown("[link](https://example.com)");
		expect(result).toContain('<a href="https://example.com">link</a>');
	});

	it("parses unordered lists", () => {
		const result = parseMarkdown("- item 1\n- item 2");
		expect(result).toContain("<li>item 1</li>");
		expect(result).toContain("<li>item 2</li>");
	});

	it("parses ordered lists", () => {
		const result = parseMarkdown("1. first\n2. second");
		expect(result).toContain("<li>first</li>");
		expect(result).toContain("<li>second</li>");
	});

	it("parses code blocks", () => {
		const result = parseMarkdown("```\ncode\n```");
		expect(result).toContain("<code>");
		expect(result).toContain("code");
	});

	it("parses inline code", () => {
		const result = parseMarkdown("`code`");
		expect(result).toContain("<code>code</code>");
	});

	it("handles empty string", () => {
		const result = parseMarkdown("");
		expect(result).toBe("");
	});

	it("handles plain text", () => {
		const result = parseMarkdown("plain text");
		expect(result).toContain("plain text");
	});

	it("enables line breaks", () => {
		const result = parseMarkdown("line 1\nline 2");
		expect(result).toContain("line 1");
		expect(result).toContain("line 2");
	});

	it("handles mixed formatting", () => {
		const result = parseMarkdown(
			"# Title\n\nSome **bold** and *italic* text.\n\n- list item",
		);
		expect(result).toContain("<h1>Title</h1>");
		expect(result).toContain("<strong>bold</strong>");
		expect(result).toContain("<em>italic</em>");
		expect(result).toContain("<li>list item</li>");
	});
});

describe("sanitizeHtml", () => {
	it("sanitizes HTML entities", () => {
		const input = "<script>alert('xss')</script>";
		const result = sanitizeHtml(input);
		expect(result).not.toContain("<script>");
	});

	it("preserves text content", () => {
		const input = "Hello <strong>world</strong>";
		const result = sanitizeHtml(input);
		expect(result).toContain("Hello");
		expect(result).toContain("world");
	});

	it("handles empty string", () => {
		const result = sanitizeHtml("");
		expect(result).toBe("");
	});

	it("handles special characters", () => {
		const input = "Test & <div>content</div> more";
		const result = sanitizeHtml(input);
		expect(result).toBeDefined();
	});
});
