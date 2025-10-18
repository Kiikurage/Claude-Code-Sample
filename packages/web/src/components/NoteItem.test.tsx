import { describe, expect, it, mock } from "bun:test";
import type { Note } from "@app/common";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { NoteItem } from "./NoteItem.js";

describe("NoteItem", () => {
	const mockNote: Note = {
		id: "test-note-1",
		title: "テストノート",
		content: "これはテストノートの内容です",
		createdAt: new Date("2025-01-15T10:00:00Z"),
	};

	it("ノートの情報を正しく表示する", () => {
		render(
			<NoteItem note={mockNote} onUpdate={() => {}} onDelete={() => {}} />,
		);

		const titleInput = screen.getByLabelText("タイトル:");
		expect(titleInput).toHaveValue("テストノート");

		const contentTextarea = screen.getByLabelText("内容:");
		expect(contentTextarea).toHaveValue("これはテストノートの内容です");

		const deleteButton = screen.getByRole("button", { name: "削除" });
		expect(deleteButton).toBeInTheDocument();
	});

	it("タイトルを変更するとonUpdateが呼ばれる", async () => {
		const user = userEvent.setup();
		const onUpdate = mock<ComponentProps<typeof NoteItem>["onUpdate"]>(
			() => {},
		);

		render(
			<NoteItem note={mockNote} onUpdate={onUpdate} onDelete={() => {}} />,
		);

		const titleInput = screen.getByLabelText("タイトル:") as HTMLInputElement;

		// タイトルに文字を追加
		await user.click(titleInput);
		await user.type(titleInput, "A");

		// onUpdateが適切な引数で呼ばれたことを確認
		expect(onUpdate).toHaveBeenCalled();
		// onUpdateの呼び出しを確認
		const calls = onUpdate.mock.calls;
		expect(calls.length).toBeGreaterThan(0);
		// いずれかの呼び出しで正しいIDと元の内容が渡されていることを確認
		expect(calls.some((call) => call[0] === "test-note-1")).toBe(true);
		expect(
			calls.some((call) => call[2] === "これはテストノートの内容です"),
		).toBe(true);
	});

	it("内容を変更するとonUpdateが呼ばれる", async () => {
		const user = userEvent.setup();
		const onUpdate = mock(() => {});

		render(
			<NoteItem note={mockNote} onUpdate={onUpdate} onDelete={() => {}} />,
		);

		const contentTextarea = screen.getByLabelText(
			"内容:",
		) as HTMLTextAreaElement;

		// 内容に文字を追加
		await user.click(contentTextarea);
		await user.type(contentTextarea, "B");

		// onUpdateが適切な引数で呼ばれたことを確認
		expect(onUpdate).toHaveBeenCalled();
		// onUpdateの呼び出しを確認
		const calls = onUpdate.mock.calls;
		expect(calls.length).toBeGreaterThan(0);
		// いずれかの呼び出しで正しいIDと元のタイトルが渡されていることを確認
		expect(calls.some((call) => (call as unknown[])[0] === "test-note-1")).toBe(
			true,
		);
		expect(
			calls.some((call) => (call as unknown[])[1] === "テストノート"),
		).toBe(true);
	});

	it("削除ボタンをクリックしてconfirmでOKするとonDeleteが呼ばれる", async () => {
		const user = userEvent.setup();
		const onDelete = mock(() => {});

		const originalConfirm = window.confirm;
		window.confirm = mock(() => true);

		render(
			<NoteItem note={mockNote} onUpdate={() => {}} onDelete={onDelete} />,
		);

		const deleteButton = screen.getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		// onDeleteが適切な引数で呼ばれたことを確認
		expect(onDelete).toHaveBeenCalledWith("test-note-1");

		// window.confirmを元に戻す
		window.confirm = originalConfirm;
	});

	it("削除ボタンをクリックしてconfirmでキャンセルするとonDeleteは呼ばれない", async () => {
		const user = userEvent.setup();
		const onDelete = mock(() => {});

		const originalConfirm = window.confirm;
		window.confirm = mock(() => false);

		render(
			<NoteItem note={mockNote} onUpdate={() => {}} onDelete={onDelete} />,
		);

		const deleteButton = screen.getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		// onDeleteが呼ばれていないことを確認
		expect(onDelete).not.toHaveBeenCalled();

		// window.confirmを元に戻す
		window.confirm = originalConfirm;
	});
});
