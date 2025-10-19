/**
 * NoteEditor Component
 * Displays and edits a single note with Markdown preview
 */

import type { Note } from "@app/common";
import type { ChangeEventHandler, ReactElement } from "react";
import { useState } from "react";
import { MarkdownPreview } from "./MarkdownPreview.js";

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
	const [showPreview, setShowPreview] = useState(false);

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
				padding: "0",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "16px 20px",
					borderBottom: "1px solid #e9ecef",
					backgroundColor: "#f8f9fa",
				}}
			>
				<div style={{ fontSize: "12px", color: "#6c757d" }}>
					作成日時: {note.createdAt.toLocaleString("ja-JP")}
				</div>
				<div style={{ display: "flex", gap: "8px" }}>
					<button
						type="button"
						onClick={() => setShowPreview(!showPreview)}
						style={{
							padding: "8px 16px",
							fontSize: "14px",
							backgroundColor: showPreview ? "#007bff" : "#6c757d",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
						onMouseOver={(e) => {
							e.currentTarget.style.backgroundColor = showPreview
								? "#0056b3"
								: "#5a6268";
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.backgroundColor = showPreview
								? "#007bff"
								: "#6c757d";
						}}
						onFocus={(e) => {
							e.currentTarget.style.backgroundColor = showPreview
								? "#0056b3"
								: "#5a6268";
						}}
						onBlur={(e) => {
							e.currentTarget.style.backgroundColor = showPreview
								? "#007bff"
								: "#6c757d";
						}}
					>
						{showPreview ? "編集" : "プレビュー"}
					</button>
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
			</div>
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "20px",
					overflow: "hidden",
				}}
			>
				<input
					id={`note-title-${note.id}`}
					type="text"
					value={note.title}
					onChange={handleTitleChange}
					placeholder="タイトルを入力してください"
					style={{
						fontSize: "28px",
						fontWeight: "bold",
						marginBottom: "16px",
						border: "none",
						outline: "none",
						padding: "0",
						backgroundColor: "transparent",
						fontFamily: "inherit",
						color: "#212529",
					}}
				/>
				{showPreview ? (
					<MarkdownPreview content={note.content} />
				) : (
					<textarea
						id={`note-content-${note.id}`}
						value={note.content}
						onChange={handleContentChange}
						placeholder="内容を入力してください。Markdownに対応しています。"
						style={{
							flex: 1,
							padding: "0",
							fontSize: "14px",
							border: "none",
							outline: "none",
							resize: "none",
							boxSizing: "border-box",
							fontFamily: "inherit",
							backgroundColor: "transparent",
							color: "#212529",
						}}
					/>
				)}
			</div>
		</div>
	);
}
