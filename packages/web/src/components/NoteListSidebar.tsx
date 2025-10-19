/**
 * NoteListSidebar Component
 * Displays a list of notes in the sidebar
 */

import type { Note } from "@app/common";
import type { ReactElement } from "react";
import { BuildInfo } from "./BuildInfo.js";

interface NoteListSidebarProps {
	notes: Note[];
	selectedNoteId: string | null;
	selectedNoteIds: Set<string>;
	onSelectNote: (id: string, ctrlKey: boolean) => void;
	onAddNote: () => void;
	onDeleteSelectedNotes: () => void;
	onCancelSelection: () => void;
}

export function NoteListSidebar({
	notes,
	selectedNoteId,
	selectedNoteIds,
	onSelectNote,
	onAddNote,
	onDeleteSelectedNotes,
	onCancelSelection,
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
				{selectedNoteIds.size > 0 ? (
					<div
						style={{
							display: "flex",
							gap: "8px",
						}}
					>
						<button
							type="button"
							onClick={onDeleteSelectedNotes}
							style={{
								flex: 1,
								padding: "10px",
								fontSize: "14px",
								backgroundColor: "#dc3545",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight: "bold",
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
							削除 ({selectedNoteIds.size}個)
						</button>
						<button
							type="button"
							onClick={onCancelSelection}
							style={{
								padding: "10px 12px",
								fontSize: "14px",
								backgroundColor: "#6c757d",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.backgroundColor = "#5a6268";
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.backgroundColor = "#6c757d";
							}}
							onFocus={(e) => {
								e.currentTarget.style.backgroundColor = "#5a6268";
							}}
							onBlur={(e) => {
								e.currentTarget.style.backgroundColor = "#6c757d";
							}}
						>
							✕
						</button>
					</div>
				) : (
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
				)}
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
							<button
								type="button"
								key={note.id}
								onClick={(e) => {
									onSelectNote(note.id, e.ctrlKey);
								}}
								style={{
									width: "100%",
									padding: "12px 16px",
									border: "none",
									borderBottom: "1px solid #ddd",
									cursor: "pointer",
									backgroundColor: selectedNoteIds.has(note.id)
										? "#fff3cd"
										: selectedNoteId === note.id
											? "#e7f3ff"
											: "transparent",
									transition: "background-color 0.2s",
									textAlign: "left",
								}}
								onMouseOver={(e) => {
									if (
										selectedNoteId !== note.id &&
										!selectedNoteIds.has(note.id)
									) {
										e.currentTarget.style.backgroundColor = "#f0f0f0";
									}
								}}
								onMouseOut={(e) => {
									if (selectedNoteIds.has(note.id)) {
										e.currentTarget.style.backgroundColor = "#fff3cd";
									} else if (selectedNoteId === note.id) {
										e.currentTarget.style.backgroundColor = "#e7f3ff";
									} else {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
								onFocus={(e) => {
									if (
										selectedNoteId !== note.id &&
										!selectedNoteIds.has(note.id)
									) {
										e.currentTarget.style.backgroundColor = "#f0f0f0";
									}
								}}
								onBlur={(e) => {
									if (selectedNoteIds.has(note.id)) {
										e.currentTarget.style.backgroundColor = "#fff3cd";
									} else if (selectedNoteId === note.id) {
										e.currentTarget.style.backgroundColor = "#e7f3ff";
									} else {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								<div
									style={{
										fontWeight:
											selectedNoteId === note.id || selectedNoteIds.has(note.id)
												? "bold"
												: "normal",
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
							</button>
						))}
					</div>
				)}
			</div>
			<BuildInfo />
		</div>
	);
}
