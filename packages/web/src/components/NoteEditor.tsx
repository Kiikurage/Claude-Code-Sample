/**
 * NoteEditor Component
 * Displays and edits a single note
 */

import type { Note } from "@app/common";
import type { ChangeEventHandler, ReactElement } from "react";

interface NoteEditorProps {
	note: Note | null;
	onUpdate: (id: string, title: string, content: string) => void;
	onDelete: (id: string) => void;
}

export function NoteEditor({
	note,
	onUpdate,
	onDelete,
}: NoteEditorProps): ReactElement {
	if (!note) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					color: "#6c757d",
					fontSize: "16px",
				}}
			>
				ノートを選択しよう
			</div>
		);
	}

	const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		onUpdate(note.id, event.target.value, note.content);
	};

	const handleContentChange: ChangeEventHandler<HTMLTextAreaElement> = (
		event,
	) => {
		onUpdate(note.id, note.title, event.target.value);
	};

	const handleDelete = () => {
		if (window.confirm("このノートを削除しますか?")) {
			onDelete(note.id);
		}
	};

	return (
		<div
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				padding: "20px",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<div style={{ fontSize: "12px", color: "#6c757d" }}>
					作成日時: {note.createdAt.toLocaleString("ja-JP")}
				</div>
				<button
					type="button"
					onClick={handleDelete}
					style={{
						padding: "8px 16px",
						fontSize: "14px",
						backgroundColor: "#dc3545",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = "#c82333";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = "#dc3545";
					}}
					onFocus={(e) => {
						e.currentTarget.style.backgroundColor = "#c82333";
					}}
					onBlur={(e) => {
						e.currentTarget.style.backgroundColor = "#dc3545";
					}}
				>
					削除
				</button>
			</div>
			<div style={{ marginBottom: "16px" }}>
				<label
					htmlFor={`note-title-${note.id}`}
					style={{
						display: "block",
						marginBottom: "8px",
						fontWeight: "bold",
						fontSize: "14px",
					}}
				>
					タイトル:
				</label>
				<input
					id={`note-title-${note.id}`}
					type="text"
					value={note.title}
					onChange={handleTitleChange}
					placeholder="タイトルを入力してください"
					style={{
						width: "100%",
						padding: "12px",
						fontSize: "16px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<label
					htmlFor={`note-content-${note.id}`}
					style={{
						display: "block",
						marginBottom: "8px",
						fontWeight: "bold",
						fontSize: "14px",
					}}
				>
					内容:
				</label>
				<textarea
					id={`note-content-${note.id}`}
					value={note.content}
					onChange={handleContentChange}
					placeholder="内容を入力してください"
					style={{
						flex: 1,
						padding: "12px",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						resize: "none",
						boxSizing: "border-box",
						fontFamily: "inherit",
					}}
				/>
			</div>
		</div>
	);
}
