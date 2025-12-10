import { Router, Request, Response } from 'express';
import Message from '../models/Message'; // Model adını düzelttim
import { verifyToken } from '../middleware/auth';
import { Types } from 'mongoose';
import Conversation from '../models/Conversation';
const router = Router();

router.get('/messages/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const conversationId = req.params.id;
        Conversation.findById(conversationId);
        if (!conversationId) {
            return res.status(400).json({ message: 'Missing param.' });
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }
        const isMember = conversation.members.some(memberId => memberId.toString() === (req as any).user.id.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied to this conversation.' });
        }
        const messages = await Message.find({
            conversationId: new Types.ObjectId(conversationId)
        })

        res.status(200).json(messages);

    } catch (error) {
        console.error('Conversation fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching conversations.' });
    }
});

export default router;