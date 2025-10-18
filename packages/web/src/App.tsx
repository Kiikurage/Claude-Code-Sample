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

	const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

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
		setSelectedNoteId(newNote.id);
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
		if (selectedNoteId === id) {
			setSelectedNoteId(null);
		}
	};

	const handleSelectNote = (id: string) => {
		setSelectedNoteId(id);
	};

	const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

	return (
		<Layout
			sidebar={
				<NoteListSidebar
					notes={notes}
					selectedNoteId={selectedNoteId}
					onSelectNote={handleSelectNote}
					onAddNote={handleAddNote}
				/>
			}
			main={
				<NoteEditor
					note={selectedNote}
					onUpdate={handleUpdateNote}
					onDelete={handleDeleteNote}
				/>
			}
		/>
	);
}
