export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  todos: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesStoragePayload {
  schemaVersion: number;
  notes: Note[];
}

export interface EditableNote {
  title: string;
  todos: TodoItem[];
}

export const STORAGE_SCHEMA_VERSION = 1;
