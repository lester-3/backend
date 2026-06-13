import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  label: string;
  month: string;
  color: string;
  file_path: string;
  dataUrl: string;
  dateTaken: string;
  timeTaken: string;
  description: string;
  tags: string;
  created_at: Date;
}

const PhotoSchema = new Schema({
  label: { type: String, required: true },
  month: { type: String, default: '' },
  color: { type: String, default: '#4285f4' },
  file_path: { type: String, default: '' },
  dataUrl: { type: String, default: '' },
  dateTaken: { type: String, default: '' },
  timeTaken: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: { type: String, default: '[]' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
