/**
 * NoteListSidebar Component
 * Displays a list of notes in the sidebar
 */

import type { Note } from "@app/common";
import type { ReactElement } from "react";

interface NoteListSidebarProps {
	notes: Note[];
	selectedNoteId: string | null;
	onSelectNote: (id: string) => void;
	onAddNote: () => void;
}

export function NoteListSidebar({
	notes,
	selectedNoteId,
	onSelectNote,
	onAddNote,
}: NoteListSidebarProps): ReactElement {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<div
				style={{
					padding: "16px",
					borderBottom: "1px solid #ddd",
				}}
			>
				<h2 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
					ノート一覧 ({notes.length}件)
				</h2>
				<button
					type="button"
					onClick={onAddNote}
					style={{
						width: "100%",
						padding: "10px",
						fontSize: "14px",
						backgroundColor: "#007bff",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						fontWeight: "bold",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = "#0056b3";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = "#007bff";
					}}
					onFocus={(e) => {
						e.currentTarget.style.backgroundColor = "#0056b3";
					}}
					onBlur={(e) => {
						e.currentTarget.style.backgroundColor = "#007bff";
					}}
				>
					+ 新規ノート作成
				</button>
			</div>
			<div
				style={{
					flex: 1,
					overflow: "auto",
				}}
			>
				{notes.length === 0 ? (
					<div
						style={{
							padding: "20px",
							textAlign: "center",
							color: "#6c757d",
							fontSize: "14px",
						}}
					>
						<p style={{ margin: 0 }}>ノートがありません</p>
					</div>
				) : (
					<div>
						{notes.map((note) => (
							<div
								key={note.id}
								onClick={() => onSelectNote(note.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										onSelectNote(note.id);
									}
								}}
								role="button"
								tabIndex={0}
								style={{
									padding: "12px 16px",
									borderBottom: "1px solid #ddd",
									cursor: "pointer",
									backgroundColor:
										selectedNoteId === note.id ? "#e7f3ff" : "transparent",
									transition: "background-color 0.2s",
								}}
								onMouseOver={(e) => {
									if (selectedNoteId !== note.id) {
										e.currentTarget.style.backgroundColor = "#f0f0f0";
									}
								}}
								onMouseOut={(e) => {
									if (selectedNoteId !== note.id) {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								<div
									style={{
										fontWeight: selectedNoteId === note.id ? "bold" : "normal",
										marginBottom: "4px",
										fontSize: "14px",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{note.title || "(無題)"}
								</div>
								<div
									style={{
										fontSize: "12px",
										color: "#6c757d",
									}}
								>
									{note.createdAt.toLocaleDateString("ja-JP")}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
