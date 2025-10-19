/**
 * Main React Application Component
 */

import type { Note } from "@app/common";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Layout } from "./components/Layout.js";
import { NoteEditor } from "./components/NoteEditor.js";
import { NoteListSidebar } from "./components/NoteListSidebar.js";

export function App(): ReactElement {
	const STORAGE_KEY = "notesData";

	const [notes, setNotes] = useState<Note[]>(() => {
		try {
			const savedData = localStorage.getItem(STORAGE_KEY);
			if (savedData) {
				const parsed = JSON.parse(savedData);
				return parsed.map((note: Note) => ({
					...note,
					createdAt: new Date(note.createdAt),
				}));
			}
		} catch (error) {
			console.error("Failed to load notes from localStorage:", error);
		}
		return [];
	});

	const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
		} catch (error) {
			console.error("Failed to save notes to localStorage:", error);
		}
	}, [notes]);

	const handleAddNote = () => {
		const newNote: Note = {
			id: uuidv4(),
			title: "",
			content: "",
			createdAt: new Date(),
		};
		setNotes((prevNotes) => [newNote, ...prevNotes]);
		setSelectedNoteIds([newNote.id]);
	};

	const handleUpdateNote = (id: string, title: string, content: string) => {
		setNotes((prevNotes) =>
			prevNotes.map((note) =>
				note.id === id ? { ...note, title, content } : note,
			),
		);
	};

	const handleDeleteNote = (id: string) => {
		setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
		setSelectedNoteIds((prev) => prev.filter((noteId) => noteId !== id));
	};

	const handleSelectNote = (id: string, modifierKey: boolean) => {
		if (modifierKey) {
			// Ctrl/Meta キーが押されている場合は複数選択
			setSelectedNoteIds((prev) => {
				if (prev.includes(id)) {
					return prev.filter((noteId) => noteId !== id);
				} else {
					return [...prev, id];
				}
			});
		} else {
			// Ctrl/Meta キーが押されていない場合は通常選択
			setSelectedNoteIds([id]);
		}
	};

	const handleDeleteSelectedNotes = () => {
		if (selectedNoteIds.length === 0) return;

		const confirmed = window.confirm(
			`${selectedNoteIds.length}個のノートを削除しますか？`,
		);
		if (!confirmed) return;

		const selectedSet = new Set(selectedNoteIds);
		setNotes((prevNotes) =>
			prevNotes.filter((note) => !selectedSet.has(note.id)),
		);
		setSelectedNoteIds([]);
	};

	const handleCancelSelection = () => {
		setSelectedNoteIds([]);
	};

	const selectedNote =
		selectedNoteIds.length > 0
			? notes.find((note) => note.id === selectedNoteIds[0]) || null
			: null;

	return (
		<Layout
			sidebar={
				<NoteListSidebar
					notes={notes}
					selectedNoteIds={selectedNoteIds}
					onSelectNote={handleSelectNote}
					onAddNote={handleAddNote}
					onDeleteSelectedNotes={handleDeleteSelectedNotes}
					onCancelSelection={handleCancelSelection}
				/>
			}
			main={
				<NoteEditor
					key={selectedNote?.id}
					note={selectedNote}
					onUpdate={handleUpdateNote}
					onDelete={handleDeleteNote}
				/>
			}
		/>
	);
}
