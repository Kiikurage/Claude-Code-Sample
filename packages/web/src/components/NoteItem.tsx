/**
 * NoteItem Component
 * Individual note display and edit component
 */

import type { Note } from "@app/common";
import type { ChangeEventHandler, ReactElement } from "react";

export function NoteItem({
	note,
	onUpdate,
	onDelete,
}: {
	note: Note;
	onUpdate: (id: string, title: string, content: string) => void;
	onDelete: (id: string) => void;
}): ReactElement {
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
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "16px",
				marginBottom: "16px",
				backgroundColor: "#fff",
			}}
		>
			<div style={{ marginBottom: "12px" }}>
				<label
					htmlFor={`note-title-${note.id}`}
					style={{
						display: "block",
						marginBottom: "4px",
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
						padding: "8px",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ marginBottom: "12px" }}>
				<label
					htmlFor={`note-content-${note.id}`}
					style={{
						display: "block",
						marginBottom: "4px",
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
					rows={5}
					style={{
						width: "100%",
						padding: "8px",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
						resize: "vertical",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					fontSize: "12px",
					color: "#666",
				}}
			>
				<span>作成日時: {note.createdAt.toLocaleString("ja-JP")}</span>
				<button
					type="button"
					onClick={handleDelete}
					style={{
						padding: "6px 12px",
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
		</div>
	);
}
