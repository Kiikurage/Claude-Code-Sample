/**
 * Main React Application Component
 */

import type { Note } from "@app/common";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BuildInfo } from "./components/BuildInfo.js";
import { NoteList } from "./components/NoteList.js";

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
	};

	return (
		<div style={{ minHeight: "100vh" }}>
			<NoteList
				notes={notes}
				onUpdate={handleUpdateNote}
				onDelete={handleDeleteNote}
				onAdd={handleAddNote}
			/>
			<BuildInfo />
		</div>
	);
}
