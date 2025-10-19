/**
 * NoteEditor Component Tests
 */

import { describe, expect, test } from "bun:test";
import type { Note } from "@app/common";
import { fireEvent, render, screen } from "@testing-library/react";
import { NoteEditor } from "./NoteEditor.js";

describe("NoteEditor", () => {
	const mockNote: Note = {
		id: "1",
		title: "Test Note",
		content: "Test Content",
		createdAt: new Date("2024-01-01T12:00:00"),
	};

	test("should display empty message when no note is selected", () => {
		const mockUpdate = () => {};
		const mockDelete = () => {};

		render(
			<NoteEditor note={null} onUpdate={mockUpdate} onDelete={mockDelete} />,
		);

		expect(screen.getByText("ノートを選択してね")).toBeTruthy();
	});

	test("should display note title and content", () => {
		const mockUpdate = () => {};
		const mockDelete = () => {};

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		const titleInput = screen.getByPlaceholderText(
			"タイトルを入力してください",
		) as HTMLInputElement;
		const contentTextarea = screen.getByPlaceholderText(
			"内容を入力してください",
		) as HTMLTextAreaElement;

		expect(titleInput.value).toBe("Test Note");
		expect(contentTextarea.value).toBe("Test Content");
	});

	test("should display creation date", () => {
		const mockUpdate = () => {};
		const mockDelete = () => {};

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		expect(screen.getByText(/作成日時: 2024\/1\/1/)).toBeTruthy();
	});

	test("should call onUpdate when title is changed", () => {
		let updatedTitle = "";
		const mockUpdate = (_id: string, title: string, _content: string) => {
			updatedTitle = title;
		};
		const mockDelete = () => {};

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		const titleInput = screen.getByPlaceholderText(
			"タイトルを入力してください",
		) as HTMLInputElement;
		fireEvent.change(titleInput, { target: { value: "New Title" } });

		expect(updatedTitle).toBe("New Title");
	});

	test("should call onUpdate when content is changed", () => {
		let updatedContent = "";
		const mockUpdate = (_id: string, _title: string, content: string) => {
			updatedContent = content;
		};
		const mockDelete = () => {};

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		const contentTextarea = screen.getByPlaceholderText(
			"内容を入力してください",
		) as HTMLTextAreaElement;
		fireEvent.change(contentTextarea, { target: { value: "New Content" } });

		expect(updatedContent).toBe("New Content");
	});

	test("should display delete button", () => {
		const mockUpdate = () => {};
		const mockDelete = () => {};

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		expect(screen.getByText("削除")).toBeTruthy();
	});

	test("should call onDelete when delete button is clicked and confirmed", () => {
		let deleteCalled = false;
		const mockUpdate = () => {};
		const mockDelete = (_id: string) => {
			deleteCalled = true;
		};

		// Mock window.confirm to always return true
		const originalConfirm = window.confirm;
		window.confirm = () => true;

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		const deleteButton = screen.getByText("削除");
		fireEvent.click(deleteButton);

		expect(deleteCalled).toBe(true);

		// Restore original confirm
		window.confirm = originalConfirm;
	});

	test("should not call onDelete when delete is cancelled", () => {
		let deleteCalled = false;
		const mockUpdate = () => {};
		const mockDelete = (_id: string) => {
			deleteCalled = true;
		};

		// Mock window.confirm to always return false
		const originalConfirm = window.confirm;
		window.confirm = () => false;

		render(
			<NoteEditor
				note={mockNote}
				onUpdate={mockUpdate}
				onDelete={mockDelete}
			/>,
		);

		const deleteButton = screen.getByText("削除");
		fireEvent.click(deleteButton);

		expect(deleteCalled).toBe(false);

		// Restore original confirm
		window.confirm = originalConfirm;
	});
});
