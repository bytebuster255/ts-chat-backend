import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  members: Types.ObjectId[];
  lastMessage: Types.ObjectId | null;
  updatedAt: Date;
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null }
  },
  { timestamps: true }
);

ConversationSchema.index({ updatedAt: -1 });

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
