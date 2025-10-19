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
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		expect(screen.getByText("ノート一覧 (2件)")).toBeTruthy();
	});

	test("should display empty message when no notes", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={[]}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		expect(screen.getByText("ノートがありません")).toBeTruthy();
		expect(screen.getByText("ノート一覧 (0件)")).toBeTruthy();
	});

	test("should display note titles", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
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
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={notesWithoutTitle}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
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
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const addButton = screen.getByText("+ 新規ノート作成");
		fireEvent.click(addButton);

		expect(addNoteCalled).toBe(true);
	});

	test("should call onSelectNote when note item is clicked without modifier key", () => {
		const selectCalls: Array<{ id: string; modifierKey: boolean }> = [];
		const mockSelectNote = (id: string, modifierKey: boolean) => {
			selectCalls.push({ id, modifierKey });
		};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const noteItem = screen.getByText("Test Note 1");
		fireEvent.click(noteItem, { ctrlKey: false, metaKey: false });

		expect(selectCalls.length).toBe(1);
		expect(selectCalls[0]).toEqual({ id: "1", modifierKey: false });
	});

	test("should call onSelectNote with modifierKey when note item is clicked with ctrl", () => {
		const selectCalls: Array<{ id: string; modifierKey: boolean }> = [];
		const mockSelectNote = (id: string, modifierKey: boolean) => {
			selectCalls.push({ id, modifierKey });
		};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const noteItem = screen.getByText("Test Note 1");
		fireEvent.click(noteItem, { ctrlKey: true });

		expect(selectCalls.length).toBe(1);
		expect(selectCalls[0]).toEqual({ id: "1", modifierKey: true });
	});

	test("should call onSelectNote with modifierKey when note item is clicked with meta key (Mac)", () => {
		const selectCalls: Array<{ id: string; modifierKey: boolean }> = [];
		const mockSelectNote = (id: string, modifierKey: boolean) => {
			selectCalls.push({ id, modifierKey });
		};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const noteItem = screen.getByText("Test Note 1");
		fireEvent.click(noteItem, { metaKey: true });

		expect(selectCalls.length).toBe(1);
		expect(selectCalls[0]).toEqual({ id: "1", modifierKey: true });
	});

	test("should highlight selected note", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		const { container } = render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId="1"
				selectedNoteIds={new Set()}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const noteItems = container.querySelectorAll("button");
		// Skip the first button which is the "add note" button
		const selectedNoteItem = noteItems[1] as HTMLElement;

		// Happy DOM returns hex colors, not rgb
		expect(selectedNoteItem.style.backgroundColor).toBe("#e7f3ff");
	});

	test("should display delete button when notes are selected", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set(["1", "2"])}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		expect(screen.getByText("削除 (2個)")).toBeTruthy();
		expect(screen.getByText("✕")).toBeTruthy();
		// The add button should not be visible
		expect(screen.queryByText("+ 新規ノート作成")).toBeFalsy();
	});

	test("should call onDeleteSelectedNotes when delete button is clicked", () => {
		let deleteNoteCalled = false;
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {
			deleteNoteCalled = true;
		};
		const mockCancelSelection = () => {};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set(["1", "2"])}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const deleteButton = screen.getByText("削除 (2個)");
		fireEvent.click(deleteButton);

		expect(deleteNoteCalled).toBe(true);
	});

	test("should call onCancelSelection when cancel button is clicked", () => {
		let cancelSelectionCalled = false;
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {
			cancelSelectionCalled = true;
		};

		render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set(["1", "2"])}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const cancelButton = screen.getByText("✕");
		fireEvent.click(cancelButton);

		expect(cancelSelectionCalled).toBe(true);
	});

	test("should highlight multiple selected notes with blue background", () => {
		const mockSelectNote = () => {};
		const mockAddNote = () => {};
		const mockDeleteSelectedNotes = () => {};
		const mockCancelSelection = () => {};

		const { container } = render(
			<NoteListSidebar
				notes={mockNotes}
				selectedNoteId={null}
				selectedNoteIds={new Set(["1"])}
				onSelectNote={mockSelectNote}
				onAddNote={mockAddNote}
				onDeleteSelectedNotes={mockDeleteSelectedNotes}
				onCancelSelection={mockCancelSelection}
			/>,
		);

		const noteItems = container.querySelectorAll("button");
		// Skip the first button which is not a note item
		const selectedNoteItem = noteItems[1] as HTMLElement;

		// Happy DOM returns hex colors
		expect(selectedNoteItem.style.backgroundColor).toBe("#e7f3ff");
	});

});
