import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  caller: string;
  receiver: string;
  date: Date;
  duration: number;
  status: 'missed' | 'accepted' | 'rejected' | 'busy';
  type: 'audio' | 'video';
  
  signalData?: any; 
}

const CallSchema: Schema = new Schema({
  caller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['missed', 'accepted', 'rejected', 'busy'], 
    default: 'missed' 
  },
  type: { type: String, enum: ['audio', 'video'], default: 'audio' },
  
  signalData: { type: Object, default: {} } 

}, { 
  timestamps: true,
  minimize: false 
});

export default mongoose.model<ICall>('Call', CallSchema);