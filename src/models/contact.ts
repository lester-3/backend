import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  avatar_path: string;
  created_at: Date;
}

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar_path: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IContact>('Contact', ContactSchema);
