import { z } from "zod";

/**
 * Note schema definition using Zod
 */
export const noteSchema = z.object({
	id: z.string().uuid({
		message: "ID must be a valid UUID",
	}),
	title: z
		.string()
		.min(1, {
			message: "Title must not be empty",
		})
		.max(200, {
			message: "Title must not exceed 200 characters",
		}),
	content: z.string(),
	createdAt: z.coerce.date(),
});

/**
 * Note type inferred from the Zod schema
 */
export type Note = z.infer<typeof noteSchema>;

/**
 * Validates a note object against the Note schema
 * @param data - The data to validate
 * @returns Result object with success status and data or error
 */
export function validateNote(data: unknown): {
	success: boolean;
	data?: Note;
	error?: z.ZodError;
} {
	const result = noteSchema.safeParse(data);

	if (result.success) {
		return {
			success: true,
			data: result.data,
		};
	}

	return {
		success: false,
		error: result.error,
	};
}

/**
 * Validates a note object and throws an error if invalid
 * @param data - The data to validate
 * @returns The validated Note object
 * @throws {z.ZodError} If the data is invalid
 */
export function parseNote(data: unknown): Note {
	return noteSchema.parse(data);
}

/**
 * Creates a partial Note schema for updates
 * All fields are optional except those that should not be updated
 */
export const noteUpdateSchema = noteSchema
	.partial({
		title: true,
		content: true,
	})
	.omit({
		id: true,
		createdAt: true,
	});

/**
 * Type for updating a note
 */
export type NoteUpdate = z.infer<typeof noteUpdateSchema>;

/**
 * Validates a note update object
 * @param data - The data to validate
 * @returns Result object with success status and data or error
 */
export function validateNoteUpdate(data: unknown): {
	success: boolean;
	data?: NoteUpdate;
	error?: z.ZodError;
} {
	const result = noteUpdateSchema.safeParse(data);

	if (result.success) {
		return {
			success: true,
			data: result.data,
		};
	}

	return {
		success: false,
		error: result.error,
	};
}

/**
 * Formats a date to the standard format: YYYY:MM:DD-hh:mm:ss
 * Ensures all numeric components are zero-padded to 2 digits
 * @param date - The date to format
 * @returns Formatted date string in YYYY:MM:DD-hh:mm:ss format
 */
export function formatCreatedDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}:${month}:${day}-${hours}:${minutes}:${seconds}`;
}
