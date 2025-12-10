import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  from: Types.ObjectId;
  conversationId: Types.ObjectId;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  isRead: boolean;
  deletedBySender: boolean;
  deletedByReceiver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    content: { type: String, required: true, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
    deletedBySender: { type: Boolean, default: false },
    deletedByReceiver: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
