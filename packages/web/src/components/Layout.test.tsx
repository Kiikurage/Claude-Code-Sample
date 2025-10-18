/**
 * Layout Component Tests
 */

import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Layout } from "./Layout.js";

describe("Layout", () => {
	test("should render sidebar and main content", () => {
		const sidebar = <div data-testid="sidebar">Sidebar Content</div>;
		const main = <div data-testid="main">Main Content</div>;

		render(<Layout sidebar={sidebar} main={main} />);

		expect(screen.getByTestId("sidebar")).toBeTruthy();
		expect(screen.getByTestId("main")).toBeTruthy();
		expect(screen.getByText("Sidebar Content")).toBeTruthy();
		expect(screen.getByText("Main Content")).toBeTruthy();
	});

	test("should render with correct HTML structure", () => {
		const sidebar = <div>Sidebar</div>;
		const main = <div>Main</div>;

		const { container } = render(<Layout sidebar={sidebar} main={main} />);

		const aside = container.querySelector("aside");
		const mainElement = container.querySelector("main");

		expect(aside).toBeTruthy();
		expect(mainElement).toBeTruthy();
	});
});
