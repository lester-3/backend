import mongoose, { Schema, Document } from 'mongoose';

export interface IDriveFile extends Document {
  name: string;
  type: string;
  size: string;
  file_path: string;
  created_at: Date;
}

const DriveFileSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, default: '0 MB' },
  file_path: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IDriveFile>('DriveFile', DriveFileSchema);
