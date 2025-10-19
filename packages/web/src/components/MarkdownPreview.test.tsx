/**
 * MarkdownPreview Component Tests
 */

import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { MarkdownPreview } from "./MarkdownPreview.js";

describe("MarkdownPreview", () => {
	it("renders bold text correctly", () => {
		const { container } = render(<MarkdownPreview content="**bold text**" />);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain("<strong>bold text</strong>");
	});

	it("renders italic text correctly", () => {
		const { container } = render(<MarkdownPreview content="*italic text*" />);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain("<em>italic text</em>");
	});

	it("renders headers correctly", () => {
		const { container: container1 } = render(<MarkdownPreview content="# Header 1" />);
		const html1 = container1.querySelector(".markdown-preview")?.innerHTML;
		expect(html1).toContain("<h1>Header 1</h1>");

		const { container: container2 } = render(<MarkdownPreview content="## Header 2" />);
		const html2 = container2.querySelector(".markdown-preview")?.innerHTML;
		expect(html2).toContain("<h2>Header 2</h2>");
	});

	it("renders links correctly", () => {
		const { container } = render(
			<MarkdownPreview content="[link](https://example.com)" />,
		);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain('<a href="https://example.com">link</a>');
	});

	it("renders lists correctly", () => {
		const { container } = render(
			<MarkdownPreview
				content="- item 1&#10;- item 2&#10;- item 3"
			/>,
		);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain("<li>item 1");
		expect(html).toContain("item 2");
		expect(html).toContain("item 3</li>");
	});

	it("renders code blocks correctly", () => {
		const { container } = render(
			<MarkdownPreview content="```\ncode block\n```" />,
		);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain("<code>");
		expect(html).toContain("code block");
	});

	it("renders empty content without error", () => {
		const { container } = render(<MarkdownPreview content="" />);
		expect(container.querySelector(".markdown-preview")).toBeDefined();
	});

	it("handles plain text correctly", () => {
		const { container } = render(<MarkdownPreview content="plain text" />);
		const html = container.querySelector(".markdown-preview")?.innerHTML;
		expect(html).toContain("plain text");
	});
});
