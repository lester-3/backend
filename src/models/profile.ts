import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  email: string;
  phone: string;
  avatar_path: string;
}

const ProfileSchema = new Schema({
  name: { type: String, default: 'Me' },
  email: { type: String, default: 'me@nmail.com' },
  phone: { type: String, default: '' },
  avatar_path: { type: String, default: '' },
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);
