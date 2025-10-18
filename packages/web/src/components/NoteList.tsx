/**
 * NoteList Component
 * Displays a list of notes
 */

import type { Note } from "@app/common";
import type { ReactElement } from "react";
import { NoteItem } from "./NoteItem.js";

/**
 * ノート一覧コンポーネントのプロパティ
 */
interface NoteListProps {
	notes: Note[];
	onUpdate: (id: string, title: string, content: string) => void;
	onDelete: (id: string) => void;
	onAdd: () => void;
}

/**
 * ノート一覧を表示するコンポーネント
 * @param props ノート一覧コンポーネントのプロパティ
 */
export function NoteList({
	notes,
	onUpdate,
	onDelete,
	onAdd,
}: NoteListProps): ReactElement {
	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h2 style={{ margin: 0 }}>ノート一覧 ({notes.length}件)</h2>
				<button
					type="button"
					onClick={onAdd}
					style={{
						padding: "10px 20px",
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
			{notes.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "40px",
						backgroundColor: "#f8f9fa",
						borderRadius: "8px",
						color: "#6c757d",
					}}
				>
					<p style={{ margin: 0, fontSize: "16px" }}>
						ノートがありません。新規ノートを作成してください。
					</p>
				</div>
			) : (
				<div>
					{notes.map((note) => (
						<NoteItem
							key={note.id}
							note={note}
							onUpdate={onUpdate}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
