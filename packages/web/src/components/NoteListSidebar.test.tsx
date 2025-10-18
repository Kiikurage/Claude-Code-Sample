/**
 * NoteListSidebar Component Tests
 */

import { describe, expect, test } from "bun:test";
import type { Note } from "@app/common";
import { fireEvent, render, screen } from "@testing-library/react";
import { NoteListSidebar } from "./NoteListSidebar.js";

// Mock global variables used by BuildInfo
globalThis.__GIT_COMMIT_HASH__ = "test-hash";
globalThis.__GIT_COMMIT_DATE__ = "2024-01-01T00:00:00.000Z";
globalThis.__GIT_BRANCH__ = "master";

describe("NoteListSidebar", () => {
	const mockNotes: Note[] = [
		{
			id: "1",
			title: "Test Note 1",
			content: "Content 1",
			createdAt: new Date("2024-01-01"),
		},
		{
			id: "2",
			title: "Test Note 2",
			content: "Content 2",
			createdAt: new Date("2024-01-02"),
		},
	];

	test("should display note count", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		expect(screen.getByText("ノート一覧 (2件)")).toBeTruthy();
	});

	test("should display empty message when no notes", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};

		render(
			<NoteListSidebar
				notes={[]}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		expect(screen.getByText("ノートがありません")).toBeTruthy();
		expect(screen.getByText("ノート一覧 (0件)")).toBeTruthy();
	});

	test("should display note titles", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		expect(screen.getByText("Test Note 1")).toBeTruthy();
		expect(screen.getByText("Test Note 2")).toBeTruthy();
	});

	test("should display '(無題)' for notes without title", () => {
		const notesWithoutTitle: Note[] = [
			{
				id: "1",
				title: "",
				content: "Content",
				createdAt: new Date("2024-01-01"),
			},
		];

		const mockSelectNote = () => {};
		const mockAddNote = () => {};

		render(
			<NoteListSidebar
				notes={notesWithoutTitle}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		expect(screen.getByText("(無題)")).toBeTruthy();
	});

	test("should call onAddNote when add button is clicked", () => {
		let addNoteCalled = false;
		const mockSelectNote = () => {};
		const mockAddNote = () => {
			addNoteCalled = true;
		};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		const addButton = screen.getByText("+ 新規ノート作成");
		fireEvent.click(addButton);

		expect(addNoteCalled).toBe(true);
	});

	test("should call onSelectNote when note item is clicked", () => {
		let selectedId = "";
		const mockSelectNote = (id: string) => {
			selectedId = id;
		};
		const mockAddNote = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		const noteItem = screen.getByText("Test Note 1");
		fireEvent.click(noteItem);

		expect(selectedId).toBe("1");
	});

	test("should highlight selected note", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};

		const { container } = render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId="1"
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
			/>,
		);

		const noteItems = container.querySelectorAll("button");
		// Skip the first button which is the "add note" button
		const selectedNoteItem = noteItems[1] as HTMLElement;

		// Happy DOM returns hex colors, not rgb
		expect(selectedNoteItem.style.backgroundColor).toBe("#e7f3ff");
	});
});
