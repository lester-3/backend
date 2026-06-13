import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  subject: string;
  body: string;
  folder: string;
  starred: number;
  read: number;
  created_at: Date;
  updated_at: Date;
}

const EmailSchema = new Schema({
  from_name: { type: String, default: '' },
  from_email: { type: String, required: true },
  to_name: { type: String, default: '' },
  to_email: { type: String, required: true },
  subject: { type: String, default: '' },
  body: { type: String, default: '' },
  folder: { type: String, default: 'inbox' },
  starred: { type: Number, default: 0 },
  read: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model<IEmail>('Email', EmailSchema);
