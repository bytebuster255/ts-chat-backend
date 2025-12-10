import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from "../models/Message";
import User from "../models/User"; // <--- 1. USER MODELİ EKLENDİ (Tokenları çekmek için)
import admin from '../utils/firebase'; // <--- 2. FIREBASE ADMIN EKLENDİ
import { getIO } from '../socket/socket';

const router = Router();

router.post('/send/:conversationId', verifyToken, async (req: any, res: Response) => {
    try {
        const senderId = req.user.id;
        const { conversationId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required." });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        const isMember = conversation.members.some(memberId => memberId.toString() === senderId);

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this conversation." });
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            from: senderId,
            content: content,
        });

        conversation.lastMessage = newMessage._id as any;
        conversation.updatedAt = new Date();
        await conversation.save();

        try {
            const io = getIO();
            conversation.members.forEach((memberId) => {
                // Herkese gönder (Client tarafında "benim mesajımsa listeye ekle ama bildirim gösterme" mantığı kurulabilir)
                io.to(memberId.toString()).emit("new_message", newMessage);
            });
        } catch (e) {
            console.error("Socket error", e);
        }

       
        (async () => {
            try {
                const sender = await User.findById(senderId).select('username avatar');
                if (!sender) return;

                const recipientIds = conversation.members.filter(
                    memberId => memberId.toString() !== senderId
                );

                if (recipientIds.length === 0) return; 

                const recipients = await User.find({ 
                    _id: { $in: recipientIds } 
                }).select('fcmTokens');

                const allTokens = recipients.flatMap(user => user.fcmTokens || []);
                if (allTokens.length > 0) {
                    const messagePayload = {
                        notification: {
                            title: sender.username,
                            body: content,
                        },
                        data: {
                            click_action: "FLUTTER_NOTIFICATION_CLICK",
                            conversationId: (conversation._id as any).toString(),
                            senderId: senderId.toString(),
                            senderName: sender.username,
                            senderAvatar: sender.avatar || ""
                        },
                        tokens: allTokens
                    };

                    const response = await admin.messaging().sendEachForMulticast(messagePayload);
                    console.log(`📨 FCM: ${response.successCount} başarılı, ${response.failureCount} hatalı.`);

                    if (response.failureCount > 0) {
                        const failedTokens: string[] = [];
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) {
                                failedTokens.push(allTokens[idx]);
                            }
                        });

                        if (failedTokens.length > 0) {
                            await User.updateMany(
                                { fcmTokens: { $in: failedTokens } },
                                { $pull: { fcmTokens: { $in: failedTokens } } }
                            );
                            console.log("🧹 FCM: Geçersiz tokenlar temizlendi.");
                        }
                    }
                }
            } catch (fcmError) {
                console.error("FCM Notification Error:", fcmError);
            }
        })();
        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Message send by ID error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;