/**
 * NoteEditor Component
 * Displays and edits a single note with Markdown preview
 */

import type { Note } from "@app/common";
import { formatCreatedDate } from "@app/common";
import type { ChangeEventHandler, ReactElement } from "react";
import { useEffect, useState } from "react";
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
	// Initialize with note content for immediate rendering on first load
	const [previewContent, setPreviewContent] = useState(
		() => note?.content ?? "",
	);

	// Debounce preview updates to avoid performance issues (but skip initial render)
	useEffect(() => {
		if (!note) return;

		// Update preview immediately
		setPreviewContent(note.content);
	}, [note]);

	// Debounce subsequent content changes
	useEffect(() => {
		if (!note) return;

		const timer = setTimeout(() => {
			setPreviewContent(note.content);
		}, 1000);

		return () => clearTimeout(timer);
	}, [note]);

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
					作成日時: {formatCreatedDate(note.createdAt)}
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
					placeholder="タイトル"
					style={{
						fontSize: "28px",
						fontWeight: "bold",
						marginBottom: "16px",
						border: "none",
						borderBottom: "1px solid #e9ecef",
						outline: "none",
						padding: "0",
						paddingBottom: "16px",
						backgroundColor: "transparent",
						fontFamily: "inherit",
						color: "#212529",
					}}
				/>
				<div
					style={{
						flex: 1,
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "0",
						overflow: "hidden",
					}}
				>
					<textarea
						id={`note-content-${note.id}`}
						value={note.content}
						onChange={handleContentChange}
						placeholder="内容を入力してください。Markdownに対応しています。"
						style={{
							padding: "12px",
							fontSize: "14px",
							border: "none",
							borderRight: "1px solid #e9ecef",
							borderRadius: "0",
							resize: "none",
							boxSizing: "border-box",
							fontFamily: "inherit",
							backgroundColor: "transparent",
							color: "#212529",
							overflow: "auto",
						}}
					/>
					<MarkdownPreview content={previewContent} />
				</div>
			</div>
		</div>
	);
}
