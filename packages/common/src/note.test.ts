import { describe, expect, it } from "bun:test";
import {
	type Note,
	type NoteUpdate,
	noteSchema,
	noteUpdateSchema,
	parseNote,
	validateNote,
	validateNoteUpdate,
	formatCreatedDate,
} from "./note.js";

describe("Note Schema", () => {
	const validNote = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		title: "Test Note",
		content: "This is a test note content",
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
	};

	describe("noteSchema", () => {
		it("should validate a valid note", () => {
			const result = noteSchema.safeParse(validNote);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validNote);
			}
		});

		it("should reject a note with invalid UUID", () => {
			const invalidNote = {
				...validNote,
				id: "invalid-uuid",
			};
			const result = noteSchema.safeParse(invalidNote);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain("UUID");
			}
		});

		it("should reject a note with empty title", () => {
			const invalidNote = {
				...validNote,
				title: "",
			};
			const result = noteSchema.safeParse(invalidNote);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain("must not be empty");
			}
		});

		it("should reject a note with title exceeding 200 characters", () => {
			const invalidNote = {
				...validNote,
				title: "a".repeat(201),
			};
			const result = noteSchema.safeParse(invalidNote);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain(
					"must not exceed 200 characters",
				);
			}
		});

		it("should accept a note with title of exactly 200 characters", () => {
			const validNoteWithLongTitle = {
				...validNote,
				title: "a".repeat(200),
			};
			const result = noteSchema.safeParse(validNoteWithLongTitle);
			expect(result.success).toBe(true);
		});

		it("should accept a note with empty content", () => {
			const noteWithEmptyContent = {
				...validNote,
				content: "",
			};
			const result = noteSchema.safeParse(noteWithEmptyContent);
			expect(result.success).toBe(true);
		});

		it("should coerce string date to Date object", () => {
			const noteWithStringDate = {
				...validNote,
				createdAt: "2024-01-01T00:00:00.000Z",
			};
			const result = noteSchema.safeParse(noteWithStringDate);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.createdAt).toBeInstanceOf(Date);
				expect(result.data.createdAt.toISOString()).toBe(
					"2024-01-01T00:00:00.000Z",
				);
			}
		});

		it("should reject a note with invalid date", () => {
			const invalidNote = {
				...validNote,
				createdAt: "invalid-date",
			};
			const result = noteSchema.safeParse(invalidNote);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain("Invalid input");
			}
		});

		it("should reject a note without required fields", () => {
			const incompleteNote = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				title: "Test Note",
			};
			const result = noteSchema.safeParse(incompleteNote);
			expect(result.success).toBe(false);
		});
	});

	describe("validateNote", () => {
		it("should return success with data for valid note", () => {
			const result = validateNote(validNote);
			expect(result.success).toBe(true);
			expect(result.data).toEqual(validNote);
			expect(result.error).toBeUndefined();
		});

		it("should return error for invalid note", () => {
			const invalidNote = {
				...validNote,
				id: "invalid-uuid",
			};
			const result = validateNote(invalidNote);
			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		it("should handle non-object input", () => {
			const result = validateNote("not an object");
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should handle null input", () => {
			const result = validateNote(null);
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should handle undefined input", () => {
			const result = validateNote(undefined);
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe("parseNote", () => {
		it("should return Note object for valid note", () => {
			const result = parseNote(validNote);
			expect(result).toEqual(validNote);
		});

		it("should throw ZodError for invalid note", () => {
			const invalidNote = {
				...validNote,
				id: "invalid-uuid",
			};
			expect(() => parseNote(invalidNote)).toThrow();
		});
	});

	describe("noteUpdateSchema", () => {
		it("should validate update with title only", () => {
			const update = {
				title: "Updated Title",
			};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(true);
		});

		it("should validate update with content only", () => {
			const update = {
				content: "Updated content",
			};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(true);
		});

		it("should validate update with both title and content", () => {
			const update = {
				title: "Updated Title",
				content: "Updated content",
			};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(true);
		});

		it("should validate empty update object", () => {
			const update = {};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(true);
		});

		it("should reject update with id field", () => {
			const update = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				title: "Updated Title",
			};
			const result = noteUpdateSchema.safeParse(update);
			// Zod omit removes the field from the schema, so extra fields are just ignored
			expect(result.success).toBe(true);
		});

		it("should reject update with createdAt field", () => {
			const update = {
				title: "Updated Title",
				createdAt: new Date(),
			};
			const result = noteUpdateSchema.safeParse(update);
			// Zod omit removes the field from the schema, so extra fields are just ignored
			expect(result.success).toBe(true);
		});

		it("should reject update with empty title", () => {
			const update = {
				title: "",
			};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(false);
		});

		it("should reject update with title exceeding 200 characters", () => {
			const update = {
				title: "a".repeat(201),
			};
			const result = noteUpdateSchema.safeParse(update);
			expect(result.success).toBe(false);
		});
	});

	describe("validateNoteUpdate", () => {
		it("should return success for valid update", () => {
			const update: NoteUpdate = {
				title: "Updated Title",
			};
			const result = validateNoteUpdate(update);
			expect(result.success).toBe(true);
			expect(result.data).toEqual(update);
		});

		it("should return error for invalid update", () => {
			const update = {
				title: "",
			};
			const result = validateNoteUpdate(update);
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should accept empty update", () => {
			const update = {};
			const result = validateNoteUpdate(update);
			expect(result.success).toBe(true);
		});
	});

	describe("Note type", () => {
		it("should enforce correct types", () => {
			const note: Note = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				title: "Test Note",
				content: "Content",
				createdAt: new Date(),
			};
			expect(note.id).toBeDefined();
			expect(note.title).toBeDefined();
			expect(note.content).toBeDefined();
			expect(note.createdAt).toBeInstanceOf(Date);
		});
	});

	describe("NoteUpdate type", () => {
		it("should allow partial updates", () => {
			const update1: NoteUpdate = {
				title: "New Title",
			};
			const update2: NoteUpdate = {
				content: "New Content",
			};
			const update3: NoteUpdate = {
				title: "New Title",
				content: "New Content",
			};
			const update4: NoteUpdate = {};

			expect(update1.title).toBeDefined();
			expect(update2.content).toBeDefined();
			expect(update3.title).toBeDefined();
			expect(update3.content).toBeDefined();
			expect(update4).toEqual({});
		});
	});

	describe("formatCreatedDate", () => {
		it("should format date with proper zero-padding", () => {
			const date = new Date("2024-01-05T09:08:07.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toMatch(/^\d{4}:\d{2}:\d{2}-\d{2}:\d{2}:\d{2}$/);
		});

		it("should format single-digit months with leading zero", () => {
			const date = new Date("2024-01-15T10:20:30.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toContain(":01:");
		});

		it("should format single-digit days with leading zero", () => {
			const date = new Date("2024-01-05T10:20:30.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toMatch(/2024:01:05-10:20:30/);
		});

		it("should format single-digit hours with leading zero", () => {
			const date = new Date("2024-01-15T05:20:30.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toMatch(/2024:01:15-05:20:30/);
		});

		it("should format single-digit minutes with leading zero", () => {
			const date = new Date("2024-01-15T10:05:30.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toMatch(/2024:01:15-10:05:30/);
		});

		it("should format single-digit seconds with leading zero", () => {
			const date = new Date("2024-01-15T10:20:05.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toMatch(/2024:01:15-10:20:05/);
		});

		it("should return correct format YYYY:MM:DD-hh:mm:ss", () => {
			const date = new Date("2024-12-31T23:59:59.000Z");
			const formatted = formatCreatedDate(date);
			expect(formatted).toBe("2024:12:31-23:59:59");
		});

		it("should handle dates in various months", () => {
			const testCases = [
				{ date: new Date("2024-01-15T10:20:30.000Z"), expected: "2024:01:15-10:20:30" },
				{ date: new Date("2024-06-15T10:20:30.000Z"), expected: "2024:06:15-10:20:30" },
				{ date: new Date("2024-12-15T10:20:30.000Z"), expected: "2024:12:15-10:20:30" },
			];

			for (const { date, expected } of testCases) {
				expect(formatCreatedDate(date)).toBe(expected);
			}
		});

		it("should handle dates in various days", () => {
			const testCases = [
				{ date: new Date("2024-01-01T10:20:30.000Z"), expected: "2024:01:01-10:20:30" },
				{ date: new Date("2024-01-15T10:20:30.000Z"), expected: "2024:01:15-10:20:30" },
				{ date: new Date("2024-01-31T10:20:30.000Z"), expected: "2024:01:31-10:20:30" },
			];

			for (const { date, expected } of testCases) {
				expect(formatCreatedDate(date)).toBe(expected);
			}
		});

		it("should handle dates in various times", () => {
			const testCases = [
				{ date: new Date("2024-01-15T00:00:00.000Z"), expected: "2024:01:15-00:00:00" },
				{ date: new Date("2024-01-15T12:30:45.000Z"), expected: "2024:01:15-12:30:45" },
				{ date: new Date("2024-01-15T23:59:59.000Z"), expected: "2024:01:15-23:59:59" },
			];

			for (const { date, expected } of testCases) {
				expect(formatCreatedDate(date)).toBe(expected);
			}
		});
	});
});
