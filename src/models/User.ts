import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  biography: string;
  rsa_public: string;
  rsa_private: string;
  recoveryRsa: string;
  fcmTokens: string[]; 

  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  biography: { type: String, default: "" },
  rsa_public: { type: String, default: "" },
  rsa_private: { type: Schema.Types.Mixed, required: true },
  recoveryRsa: { type: Schema.Types.Mixed, required: true },
  fcmTokens: { type: [String], default: [] } 

}, {
  timestamps: true
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);