import { Router, Request, Response } from 'express';
import Conversation from '../models/Conversation'; // Model adını düzelttim
import { verifyToken } from '../middleware/auth';
import Message from "../models/Message";
import { getIO } from '../socket/socket';

const router = Router();

router.get('/conversations', verifyToken, async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.id;
        console.log("Fetching conversations for user ID:", currentUserId);
        const conversations = await Conversation.find({
            members: { $in: [currentUserId] } 
        })
            .populate("members", "username avatar") 
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        // 4. Sonucu döndür
        res.status(200).json(conversations);

    } catch (error) {
        console.error('Conversation fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching conversations.' });
    }
});

router.get('/conversations/check/:receiverId', verifyToken, async (req: any, res: Response) => {
    try {
        const myId = req.user.id;
        const targetId = req.params.receiverId;

        const conversation = await Conversation.findOne({
            members: { $all: [myId, targetId], $size: 2 }
        }).populate("members", "username avatar");

        if (conversation) {
            return res.status(200).json(conversation);
        } else {
            return res.status(200).json(null);
        }

    } catch (error) {
        console.error('Conversation check error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});


router.post('/conversations/create-dm', verifyToken, async (req: any, res: Response) => {
    try {
        const senderId = req.user.id;

        const { receiverId, content } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required." });
        }

        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId],
                lastMessage: null,
            });
            console.log("✅ Yeni DM oluşturuldu:", conversation._id);
        } else {
            console.log("ℹ️ Mevcut DM bulundu:", conversation._id);
        }

        if (content) {
            const newMessage = await Message.create({
                conversationId: conversation._id,
                from: senderId,
                to: receiverId,
                content: content,
            });

            conversation.lastMessage = newMessage._id as any;
            conversation.updatedAt = new Date();
            await conversation.save();

            try {
                const io = getIO();
                if (io) {
                    io.to(receiverId).emit("new_message", newMessage);
                }
            } catch (socketError) {
                console.error("Socket emit hatası:", socketError);
            }

            return res.status(200).json({
                conversation,
                message: newMessage
            });
        }

        return res.status(200).json({ conversation });

    } catch (error) {
        console.error('Create DM error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;