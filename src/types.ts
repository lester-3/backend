export interface Email {
  id: number;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  subject: string;
  body: string;
  folder: string;
  starred: number;
  read: number;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface CreateEmailPayload {
  from_name: string;
  from_email: string;
  to_name?: string;
  to_email: string;
  subject: string;
  body: string;
  folder?: string;
}
