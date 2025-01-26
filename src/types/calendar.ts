export interface CalendarNote {
  id: string;
  user_id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  date: string;
  content: string;
}
